import { Router } from "express";
import { paymentsController } from "../controllers/payments.controller";

export const webhooksRouter: Router = Router();

webhooksRouter.post("/razorpay", paymentsController.webhook);
