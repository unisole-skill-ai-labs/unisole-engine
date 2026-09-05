import crypto from "crypto";
import { ordersRepository, ListOrdersFilter } from "../repositories/orders.repository";
import { pricingService } from "./pricing.service";
import { usersRepository } from "../repositories/users.repository";
import { paymentsRepository } from "../repositories/payments.repository";
import { enrollmentsRepository } from "../repositories/enrollments.repository";
import { Order, OrderItem, ItemType, OrderStatus } from "../db/schema";
import { NotFoundError, ValidationError, ConflictError } from "../errors";

export interface CreateOrderDto {
  userId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  items: Array<{
    itemType: ItemType;
    itemId: string;
    quantity?: number;
    metadata?: Record<string, any>;
  }>;
  couponCode?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export const ordersService = {
  /**
   * Create a standardized multi-item order with dynamic price resolution,
   * coupon evaluation, and Razorpay order ID preparation.
   */
  async createCheckoutOrder(dto: CreateOrderDto): Promise<{
    order: Order & { items: OrderItem[] };
    checkout: {
      orderId: string;
      orderNumber: string;
      razorpayOrderId: string;
      amountPaise: number;
      currency: string;
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      keyId?: string;
    };
  }> {
    if (!dto.userId) {
      throw new ValidationError("User ID is required to create an order");
    }
    if (!dto.items || dto.items.length === 0) {
      throw new ValidationError("At least one item is required to checkout");
    }

    const user = await usersRepository.getById(dto.userId);
    if (!user) {
      throw new NotFoundError("User account not found");
    }

    const customerName = dto.customerName || user.name || "Student";
    const userMeta = (typeof user.metadata === "object" && user.metadata !== null)
      ? (user.metadata as Record<string, any>)
      : {};
    const customerEmail = dto.customerEmail || userMeta.email || "student@unisole.org";
    const customerPhone = dto.customerPhone || user.phone || "";

    // 1. Resolve pricing for every item dynamically
    const resolvedItems: Array<{
      itemType: ItemType;
      itemId: string;
      itemTitle: string;
      quantity: number;
      unitPricePaise: number;
      totalPricePaise: number;
      metadata: Record<string, any>;
    }> = [];

    let calculatedTotalPaise = 0;

    for (const item of dto.items) {
      const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
      const priceInfo = await pricingService.resolveItemPrice(item.itemType, item.itemId);

      // Check for duplicate active enrollment
      const existingEnrollment = await enrollmentsRepository.getActiveByUserAndItem(
        user.id,
        item.itemType,
        item.itemId
      );
      if (existingEnrollment) {
        throw new ConflictError(`You are already actively enrolled in: ${priceInfo.title}`);
      }

      const lineTotal = priceInfo.pricePaise * qty;
      calculatedTotalPaise += lineTotal;

      resolvedItems.push({
        itemType: item.itemType,
        itemId: item.itemId,
        itemTitle: priceInfo.title,
        quantity: qty,
        unitPricePaise: priceInfo.pricePaise,
        totalPricePaise: lineTotal,
        metadata: item.metadata || {},
      });
    }

    // 2. Evaluate Coupon if provided
    let discountAmountPaise = 0;
    let validatedCouponCode: string | null = null;

    if (dto.couponCode && dto.couponCode.trim()) {
      const couponEval = await pricingService.evaluateCoupon(
        dto.couponCode.trim(),
        resolvedItems.map((ri) => ({
          itemType: ri.itemType,
          itemId: ri.itemId,
          pricePaise: ri.totalPricePaise,
        })),
        calculatedTotalPaise
      );

      if (couponEval.valid && couponEval.discountAmountPaise > 0) {
        discountAmountPaise = couponEval.discountAmountPaise;
        validatedCouponCode = dto.couponCode.trim().toUpperCase();
      } else if (couponEval.message) {
        throw new ValidationError(couponEval.message);
      }
    }

    const finalAmountPaise = Math.max(0, calculatedTotalPaise - discountAmountPaise);

    // 3. Generate Order Number & Razorpay Order ID
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    const orderNumber = `ORD-${dateStr}-${randomHex}`;
    const razorpayOrderId = `order_${crypto.randomBytes(8).toString("hex")}`;

    // 4. Save Order and Order Items atomically in DB
    const createdOrder = await ordersRepository.create(
      {
        orderNumber,
        userId: user.id,
        customerName,
        customerEmail,
        customerPhone,
        subtotalPaise: calculatedTotalPaise,
        discountPaise: discountAmountPaise,
        totalPaise: finalAmountPaise,
        currency: "INR",
        status: "PENDING",
        couponCode: validatedCouponCode || undefined,
        razorpayOrderId,
        notes: dto.notes || null,
        metadata: dto.metadata || {},
      },
      resolvedItems
    );

    // Also create the initial payment tracking record
    await paymentsRepository.create({
      userId: user.id,
      orderId: createdOrder.id,
      itemType: resolvedItems[0]?.itemType,
      itemId: resolvedItems[0]?.itemId,
      pathwayId: resolvedItems[0]?.itemType === "PATHWAY" ? resolvedItems[0].itemId : undefined,
      amountPaise: finalAmountPaise,
      currency: "INR",
      status: "CREATED",
      provider: "RAZORPAY",
      providerOrderId: razorpayOrderId,
    });

    return {
      order: createdOrder,
      checkout: {
        orderId: createdOrder.id,
        orderNumber: createdOrder.orderNumber || orderNumber,
        razorpayOrderId,
        amountPaise: finalAmountPaise,
        currency: "INR",
        customerName,
        customerEmail,
        customerPhone,
        keyId: process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY || "",
      },
    };
  },

  /**
   * List orders with filtering (Admin sees all; users see only their own)
   */
  async listOrders(
    filters: ListOrdersFilter,
    user?: { id: string; role: string }
  ) {
    if (!user) return { items: [], total: 0 };

    const queryFilters: ListOrdersFilter = { ...filters };
    if (user.role !== "ADMIN") {
      queryFilters.userId = user.id;
    }

    return ordersRepository.list(queryFilters);
  },

  /**
   * Get single order by ID with access control
   */
  async getOrderById(id: string, user?: { id: string; role: string }) {
    const order = await ordersRepository.getById(id);
    if (!order) throw new NotFoundError("Order not found");

    if (user && user.role !== "ADMIN" && order.userId !== user.id) {
      throw new NotFoundError("Order not found");
    }

    return order;
  },

  /**
   * Admin Manual Payment Confirmation (e.g. Offline UPI / Cash / Free Scholarship grant)
   */
  async confirmManualPayment(
    orderId: string,
    adminUser: { id: string; name: string },
    notes?: string
  ) {
    const order = await ordersRepository.getById(orderId);
    if (!order) throw new NotFoundError("Order not found");

    if (order.status === "PAID") {
      throw new ConflictError("Order is already marked as PAID");
    }

    // Update order status to PAID
    const updatedOrder = await ordersRepository.update(order.id, {
      status: "PAID",
      notes: notes
        ? `${order.notes ? order.notes + " | " : ""}Manual Admin Approval by ${adminUser.name}: ${notes}`
        : `${order.notes ? order.notes + " | " : ""}Manually confirmed by ${adminUser.name}`,
    });

    // Record manual payment
    await paymentsRepository.create({
      userId: order.userId || adminUser.id,
      orderId: order.id,
      amountPaise: order.totalPaise,
      currency: order.currency,
      status: "SUCCESS",
      provider: "MANUAL_ADMIN",
      providerOrderId: `manual_${order.orderNumber || order.id}`,
      providerPaymentId: `pay_manual_${Date.now()}`,
      paidAt: new Date().toISOString(),
    });

    // Fulfill enrollments for each item in the order
    const enrollmentsCreated = [];
    if (order.userId) {
      for (const item of order.items) {
        const existing = await enrollmentsRepository.getActiveByUserAndItem(
          order.userId,
          item.itemType,
          item.itemId
        );
        if (!existing) {
          const enr = await enrollmentsRepository.create({
            userId: order.userId,
            itemType: item.itemType,
            itemId: item.itemId,
            pathwayId: item.itemType === "PATHWAY" ? item.itemId : undefined,
            source: "ADMIN_MANUAL",
            orderId: order.id,
            status: "ACTIVE",
            enrolledAt: new Date().toISOString(),
          });
          enrollmentsCreated.push(enr);
        }
      }
    }

    return {
      order: updatedOrder,
      enrollments: enrollmentsCreated,
      message: "Order marked as PAID and enrollments fulfilled successfully",
    };
  },
};
