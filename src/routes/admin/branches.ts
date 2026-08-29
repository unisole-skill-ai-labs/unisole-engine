import { Router } from "express";
import { branchesController } from "../../controllers/branches.controller";
import { validateBody } from "../../middleware/validate";

export const adminBranchesRouter: Router = Router();

adminBranchesRouter.get("/", branchesController.list);
adminBranchesRouter.get("/:id", branchesController.getById);
adminBranchesRouter.post("/", validateBody({ required: ["name"] }), branchesController.create);
adminBranchesRouter.put("/:id", branchesController.update);
adminBranchesRouter.delete("/:id", branchesController.delete);
