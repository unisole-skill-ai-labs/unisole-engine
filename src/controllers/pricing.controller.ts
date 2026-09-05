import { Request, Response } from "express";
import { pricingService } from "../services/pricing.service";
import { asyncHandler } from "../middleware/async-handler";
import { CustomRequest } from "../middleware/auth";
import { ValidationError } from "../errors";

export const pricingController = {
  // Public Dynamic Pricing Catalog
  getPublicPricing: asyncHandler(async (req: Request, res: Response) => {
    const list = await pricingService.listPublicPricing();
    res.json({
      success: true,
      items: list,
    });
  }),

  // Public Coupon Validation
  validateCoupon: asyncHandler(async (req: Request, res: Response) => {
    const { code, items, totalAmountPaise } = req.body;
    if (!code) {
      throw new ValidationError("Coupon code is required");
    }
    const result = await pricingService.evaluateCoupon(
      code,
      Array.isArray(items) ? items : [],
      totalAmountPaise || 0
    );
    res.json({
      success: true,
      ...result,
    });
  }),

  // Admin Pricing Catalog Management
  adminListPricing: asyncHandler(async (req: CustomRequest, res: Response) => {
    const list = await pricingService.listAllPricing();
    res.json({
      success: true,
      items: list,
    });
  }),

  adminUpsertPricing: asyncHandler(async (req: CustomRequest, res: Response) => {
    const created = await pricingService.upsertPricing(req.body);
    res.status(201).json({
      success: true,
      data: created,
    });
  }),

  adminUpdatePricing: asyncHandler(async (req: CustomRequest, res: Response) => {
    const id = req.params.id;
    if (!id) throw new ValidationError("Pricing item ID is required");

    const updated = await pricingService.updatePricing(id, req.body);
    res.json({
      success: true,
      data: updated,
    });
  }),

  adminDeletePricing: asyncHandler(async (req: CustomRequest, res: Response) => {
    const id = req.params.id;
    if (!id) throw new ValidationError("Pricing item ID is required");

    const deleted = await pricingService.deletePricing(id);
    res.json({
      success: true,
      data: deleted,
      message: "Pricing item deleted successfully",
    });
  }),

  // Admin Coupons Management
  adminListCoupons: asyncHandler(async (req: CustomRequest, res: Response) => {
    const list = await pricingService.listCoupons();
    res.json({
      success: true,
      items: list,
    });
  }),

  adminCreateCoupon: asyncHandler(async (req: CustomRequest, res: Response) => {
    const created = await pricingService.createCoupon(req.body);
    res.status(201).json({
      success: true,
      data: created,
    });
  }),

  adminUpdateCoupon: asyncHandler(async (req: CustomRequest, res: Response) => {
    const id = req.params.id;
    if (!id) throw new ValidationError("Coupon ID is required");

    const updated = await pricingService.updateCoupon(id, req.body);
    res.json({
      success: true,
      data: updated,
    });
  }),

  adminDeleteCoupon: asyncHandler(async (req: CustomRequest, res: Response) => {
    const id = req.params.id;
    if (!id) throw new ValidationError("Coupon ID is required");

    const deleted = await pricingService.deleteCoupon(id);
    res.json({
      success: true,
      data: deleted,
      message: "Coupon deleted successfully",
    });
  }),
};
