import { Router } from "express";
import { createCrudRouter } from "../crud";
import { assignments } from "../db/schema";

export const assignmentsRouter: Router = createCrudRouter({
  table: assignments,
});
