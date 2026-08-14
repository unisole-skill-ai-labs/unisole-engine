import { Router } from "express";
import { createCrudRouter } from "../crud";
import { moduleLessons } from "../db/schema";

export const moduleLessonsRouter: Router = createCrudRouter({
  table: moduleLessons,
});
