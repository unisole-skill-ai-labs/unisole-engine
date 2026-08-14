import { Router } from "express";
import { createCrudRouter } from "../crud";
import { moduleItems } from "../db/schema";

export const moduleItemsRouter: Router = createCrudRouter({
  table: moduleItems,
});
