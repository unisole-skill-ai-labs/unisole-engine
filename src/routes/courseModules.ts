import { Router } from "express";
import { createCrudRouter } from "../crud";
import { courseModules } from "../db/schema";

export const courseModulesRouter: Router = createCrudRouter({
  table: courseModules,
});
