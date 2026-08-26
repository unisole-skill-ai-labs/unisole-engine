import { Router } from "express";
import { pathwaysController } from "../../controllers/pathways.controller";
import { validateBody } from "../../middleware/validate";

export const adminPathwaysRouter: Router = Router();

adminPathwaysRouter.get("/", pathwaysController.list);
adminPathwaysRouter.get("/:id", pathwaysController.getById);
adminPathwaysRouter.post("/", validateBody({ required: ["title", "slug"] }), pathwaysController.create);
adminPathwaysRouter.put("/:id", pathwaysController.update);

// Categories
adminPathwaysRouter.post("/:id/categories", validateBody({ required: ["categoryId"] }), pathwaysController.attachCategory);
adminPathwaysRouter.delete("/:id/categories/:categoryId", pathwaysController.detachCategory);

// Colleges
adminPathwaysRouter.post("/:id/colleges", validateBody({ required: ["collegeId"] }), pathwaysController.attachCollege);
adminPathwaysRouter.delete("/:id/colleges/:collegeId", pathwaysController.detachCollege);

// Courses
adminPathwaysRouter.post("/:id/courses", validateBody({ required: ["courseId", "position"] }), pathwaysController.attachCourse);
adminPathwaysRouter.delete("/:id/courses/:courseId", pathwaysController.detachCourse);
adminPathwaysRouter.get("/:id/courses", pathwaysController.getCourses);
