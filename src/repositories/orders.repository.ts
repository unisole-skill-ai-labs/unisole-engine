import { eq, and, desc, sql, ilike, or } from "drizzle-orm";
import { db } from "../db";
import { orders, orderItems, Order, NewOrder, OrderItem, NewOrderItem, users, payments } from "../db/schema";

export interface ListOrdersFilter {
  userId?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface OrderMetrics {
  totalRevenuePaise: number;
  paidOrdersCount: number;
  pendingOrdersCount: number;
  totalOrdersCount: number;
}

export interface ListOrdersResult {
  items: (Order & { items: OrderItem[] })[];
  total: number;
  metrics: OrderMetrics;
}

export const ordersRepository = {
  /**
   * Reconcile successful payments to ensure orders are marked PAID and missing orders backfilled.
   */
  async reconcileSuccessfulPayments(): Promise<number> {
    try {
      // 1. Link payments with null order_id to existing orders by matching razorpay_order_id
      await db.execute(sql`
        UPDATE payments
        SET order_id = orders.id, updated_at = NOW()
        FROM orders
        WHERE payments.order_id IS NULL
          AND payments.provider_order_id IS NOT NULL
          AND orders.razorpay_order_id IS NOT NULL
          AND payments.provider_order_id = orders.razorpay_order_id;
      `);

      // 2. Mark orders as PAID where linked payment has status SUCCESS
      const updateRes = await db.execute(sql`
        UPDATE orders
        SET status = 'PAID',
            paid_at = COALESCE(orders.paid_at, payments.paid_at, NOW()),
            updated_at = NOW()
        FROM payments
        WHERE payments.order_id = orders.id
          AND payments.status = 'SUCCESS'
          AND orders.status != 'PAID';
      `);

      // 3. Backfill missing orders for orphan successful payments
      const orphanPayments = await db.execute<any>(sql`
        SELECT p.id as payment_id, p.user_id, p.amount_paise, p.currency, p.provider_order_id,
               p.paid_at, p.item_type, p.item_id, p.created_at,
               u.name as user_name, u.phone as user_phone,
               (u.metadata->>'email') as user_email
        FROM payments p
        LEFT JOIN orders o ON p.order_id = o.id
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.status = 'SUCCESS'
          AND p.order_id IS NULL
          AND p.amount_paise > 0
        LIMIT 50;
      `);

      const orphanRows = (orphanPayments as any).rows || orphanPayments || [];
      for (const p of orphanRows) {
        const orderNumber = `ORD-REC-${String(p.payment_id).replace(/^pay_/, "").slice(0, 10).toUpperCase()}`;
        const [newOrder] = await db.insert(orders).values({
          orderNumber,
          userId: p.user_id,
          customerName: p.user_name || "Learner",
          customerPhone: p.user_phone || null,
          customerEmail: p.user_email || null,
          subtotalPaise: Number(p.amount_paise),
          discountPaise: 0,
          totalPaise: Number(p.amount_paise),
          currency: p.currency || "INR",
          status: "PAID",
          paidAt: p.paid_at || p.created_at || new Date().toISOString(),
          razorpayOrderId: p.provider_order_id || null,
          notes: `Reconciled from gateway payment ${p.payment_id}`,
        }).returning();

        if (newOrder) {
          await db.update(payments).set({ orderId: newOrder.id }).where(eq(payments.id, p.payment_id));
          await db.insert(orderItems).values({
            orderId: newOrder.id,
            itemType: (p.item_type as any) || "PATHWAY",
            itemId: p.item_id || "OFFERING",
            itemTitle: `Enrollment Offering (${p.item_type || "ITEM"})`,
            unitPricePaise: Number(p.amount_paise),
            quantity: 1,
            totalPricePaise: Number(p.amount_paise),
          });
        }
      }

      return ((updateRes as any)?.rowCount || 0) + (orphanRows.length || 0);
    } catch (err) {
      console.warn("[OrdersRepository] Reconcile warning:", err);
      return 0;
    }
  },

  async list(filters: ListOrdersFilter = {}): Promise<ListOrdersResult> {
    const conditions = [];

    if (filters.userId) {
      conditions.push(eq(orders.userId, filters.userId));
    }
    if (filters.status) {
      conditions.push(eq(orders.status, filters.status as any));
    }
    if (filters.search && filters.search.trim()) {
      const q = `%${filters.search.trim()}%`;
      conditions.push(
        or(
          ilike(orders.orderNumber, q),
          ilike(orders.customerName, q),
          ilike(orders.customerEmail, q),
          ilike(orders.customerPhone, q),
          ilike(orders.razorpayOrderId, q)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const limit = filters.limit ?? 50;
    const offset = filters.offset ?? 0;

    const [orderRows, countRes, metricsRes] = await Promise.all([
      db
        .select()
        .from(orders)
        .where(whereClause)
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(orders)
        .where(whereClause),
      db
        .select({
          totalRevenuePaise: sql<number>`COALESCE(SUM(CASE WHEN ${orders.status}::text = 'PAID' THEN ${orders.totalPaise} ELSE 0 END), 0)::bigint`,
          paidOrdersCount: sql<number>`COALESCE(COUNT(*) FILTER (WHERE ${orders.status}::text = 'PAID'), 0)::int`,
          pendingOrdersCount: sql<number>`COALESCE(COUNT(*) FILTER (WHERE ${orders.status}::text = 'PENDING'), 0)::int`,
          totalOrdersCount: sql<number>`COUNT(*)::int`,
        })
        .from(orders)
        .where(filters.userId ? eq(orders.userId, filters.userId) : undefined),
    ]);

    const total = countRes[0]?.count ?? 0;
    const metrics: OrderMetrics = {
      totalRevenuePaise: Number(metricsRes[0]?.totalRevenuePaise || 0),
      paidOrdersCount: Number(metricsRes[0]?.paidOrdersCount || 0),
      pendingOrdersCount: Number(metricsRes[0]?.pendingOrdersCount || 0),
      totalOrdersCount: Number(metricsRes[0]?.totalOrdersCount || 0),
    };

    // Fetch items for each order
    if (orderRows.length === 0) {
      return { items: [], total, metrics };
    }

    const orderIds = orderRows.map((o) => o.id);
    const itemRows = await db
      .select()
      .from(orderItems)
      .where(sql`${orderItems.orderId} IN ${orderIds}`);

    const itemsMap = new Map<string, OrderItem[]>();
    for (const item of itemRows) {
      const list = itemsMap.get(item.orderId) || [];
      list.push(item);
      itemsMap.set(item.orderId, list);
    }

    const populatedOrders = orderRows.map((o) => ({
      ...o,
      items: itemsMap.get(o.id) || [],
    }));

    return { items: populatedOrders, total, metrics };
  },

  async getById(id: string): Promise<(Order & { items: OrderItem[] }) | null> {
    const rows = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!rows[0]) return null;

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
    return { ...rows[0], items };
  },

  async getByOrderNumber(orderNumber: string): Promise<(Order & { items: OrderItem[] }) | null> {
    const rows = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
    if (!rows[0]) return null;

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, rows[0].id));
    return { ...rows[0], items };
  },

  async getByRazorpayOrderId(razorpayOrderId: string): Promise<(Order & { items: OrderItem[] }) | null> {
    const rows = await db.select().from(orders).where(eq(orders.razorpayOrderId, razorpayOrderId)).limit(1);
    if (!rows[0]) return null;

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, rows[0].id));
    return { ...rows[0], items };
  },

  async create(
    orderData: NewOrder,
    itemsData: Array<Omit<NewOrderItem, "id" | "orderId">>
  ): Promise<Order & { items: OrderItem[] }> {
    return db.transaction(async (tx) => {
      const [newOrder] = await tx.insert(orders).values(orderData).returning();
      
      let insertedItems: OrderItem[] = [];
      if (itemsData.length > 0) {
        insertedItems = await tx
          .insert(orderItems)
          .values(
            itemsData.map((item) => ({
              ...item,
              orderId: newOrder.id,
            }))
          )
          .returning();
      }

      return {
        ...newOrder,
        items: insertedItems,
      };
    });
  },

  async update(id: string, data: Partial<Omit<NewOrder, "id">>): Promise<Order | null> {
    const [updated] = await db
      .update(orders)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(orders.id, id))
      .returning();
    return updated ?? null;
  },

  async updateStatus(id: string, status: Order["status"]): Promise<Order | null> {
    const updatePayload: any = { status, updatedAt: new Date().toISOString() };
    if (status === "PAID") {
      updatePayload.paidAt = new Date().toISOString();
    }
    const [updated] = await db
      .update(orders)
      .set(updatePayload)
      .where(eq(orders.id, id))
      .returning();
    return updated ?? null;
  },

  async delete(id: string): Promise<boolean> {
    return db.transaction(async (tx) => {
      await tx.delete(orderItems).where(eq(orderItems.orderId, id));
      const res = await tx.delete(orders).where(eq(orders.id, id));
      return (res.rowCount ?? 0) > 0;
    });
  },

  async countPaidOrdersByUser(userId: string, excludeOrderId?: string): Promise<number> {
    const conditions = [
      eq(orders.userId, userId),
      eq(orders.status, "PAID"),
    ];
    if (excludeOrderId) {
      conditions.push(sql`${orders.id} != ${excludeOrderId}`);
    }
    const [res] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(and(...conditions));
    return res?.count || 0;
  },
};

