import { Router } from "express";
import { createCrudRouter } from "../crud";
import { categories } from "../db/schema";

export const categoriesRouter: Router = createCrudRouter({
  table: categories,
});
