import { Router } from "express";
import { createCrudRouter } from "../crud";
import { assignmentSubmissions } from "../db/schema";

export const assignmentSubmissionsRouter: Router = createCrudRouter({
  table: assignmentSubmissions,
});
