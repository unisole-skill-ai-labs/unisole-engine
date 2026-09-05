import { Response } from "express";
import { ordersService } from "../services/orders.service";
import { asyncHandler } from "../middleware/async-handler";
import { CustomRequest } from "../middleware/auth";
import { ValidationError } from "../errors";

export const ordersController = {
  /**
   * Universal multi-item checkout endpoint
   * POST /api/orders/checkout or /api/payments/create-order
   */
  createCheckout: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user?.id || req.body.userId;
    if (!userId) {
      throw new ValidationError("User authentication or userId is required");
    }

    // Support both new `items: []` format AND legacy `{ pathwayId: string }`
    let items = req.body.items;
    if (!items && req.body.pathwayId) {
      items = [
        {
          itemType: "PATHWAY",
          itemId: req.body.pathwayId,
          quantity: 1,
        },
      ];
    } else if (!items && req.body.workshopId) {
      items = [
        {
          itemType: "WORKSHOP",
          itemId: req.body.workshopId,
          quantity: 1,
        },
      ];
    }

    const result = await ordersService.createCheckoutOrder({
      userId,
      customerName: req.body.customerName,
      customerEmail: req.body.customerEmail,
      customerPhone: req.body.customerPhone,
      items,
      couponCode: req.body.couponCode,
      notes: req.body.notes,
      metadata: req.body.metadata,
    });

    res.status(201).json({
      success: true,
      ...result,
    });
  }),

  /**
   * User's own orders
   * GET /api/orders/my-orders
   */
  listMyOrders: asyncHandler(async (req: CustomRequest, res: Response) => {
    const result = await ordersService.listOrders({}, req.user);
    res.json({
      success: true,
      ...result,
    });
  }),

  /**
   * Single order detail
   * GET /api/orders/:id
   */
  getById: asyncHandler(async (req: CustomRequest, res: Response) => {
    const orderId = req.params.id;
    if (!orderId) {
      throw new ValidationError("Order ID is required");
    }
    const order = await ordersService.getOrderById(orderId, req.user);
    res.json({
      success: true,
      data: order,
    });
  }),

  /**
   * Admin order list with filters & pagination
   * GET /api/admin/orders
   */
  adminList: asyncHandler(async (req: CustomRequest, res: Response) => {
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const result = await ordersService.listOrders({ status, search, limit, offset }, req.user);
    res.json({
      success: true,
      ...result,
    });
  }),

  /**
   * Admin manual order approval / payment confirmation
   * POST /api/admin/orders/:id/confirm-manual
   */
  adminConfirmManual: asyncHandler(async (req: CustomRequest, res: Response) => {
    const orderId = req.params.id;
    if (!orderId) {
      throw new ValidationError("Order ID is required");
    }

    const adminUser = {
      id: req.user?.id || "admin",
      name: req.user?.name || "Admin",
    };

    const result = await ordersService.confirmManualPayment(
      orderId,
      adminUser,
      req.body.notes
    );

    res.json({
      success: true,
      ...result,
    });
  }),
};
