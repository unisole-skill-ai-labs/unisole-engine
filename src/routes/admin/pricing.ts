import { Router } from "express";
import { pricingController } from "../../controllers/pricing.controller";
import { validateBody } from "../../middleware/validate";

export const adminPricingRouter: Router = Router();

adminPricingRouter.get("/", pricingController.adminListPricing);
adminPricingRouter.post(
  "/",
  validateBody({ required: ["itemType", "itemId", "title", "pricePaise", "mrpPaise"] }),
  pricingController.adminUpsertPricing
);
adminPricingRouter.put("/:id", pricingController.adminUpdatePricing);
adminPricingRouter.delete("/:id", pricingController.adminDeletePricing);
