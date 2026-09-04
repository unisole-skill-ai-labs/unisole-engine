import { Router } from "express";
import { hierarchyController } from "../../controllers/hierarchy.controller";

export const adminHierarchyRouter = Router();

adminHierarchyRouter.post("/upgrade-subtask", hierarchyController.upgradeSubtask);
adminHierarchyRouter.post("/downgrade-task", hierarchyController.downgradeTask);
adminHierarchyRouter.post("/upgrade-task", hierarchyController.upgradeTask);
adminHierarchyRouter.post("/downgrade-subproject", hierarchyController.downgradeSubProject);
adminHierarchyRouter.post("/upgrade-subproject", hierarchyController.upgradeSubProject);
adminHierarchyRouter.post("/downgrade-project", hierarchyController.downgradeProject);
adminHierarchyRouter.post("/move-item", hierarchyController.moveItem);
