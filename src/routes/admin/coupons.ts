import { Router } from "express";
import { pricingController } from "../../controllers/pricing.controller";
import { validateBody } from "../../middleware/validate";

export const adminCouponsRouter: Router = Router();

adminCouponsRouter.get("/", pricingController.adminListCoupons);
adminCouponsRouter.post(
  "/",
  validateBody({ required: ["code", "discountType", "discountValue"] }),
  pricingController.adminCreateCoupon
);
adminCouponsRouter.put("/:id", pricingController.adminUpdateCoupon);
adminCouponsRouter.delete("/:id", pricingController.adminDeleteCoupon);
