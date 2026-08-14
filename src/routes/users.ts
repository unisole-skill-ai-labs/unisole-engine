import { Router } from "express";
import { createCrudRouter } from "../crud";
import { users } from "../db/schema";

export const usersRouter: Router = createCrudRouter({
  table: users,
  hasUpdatedAt: true,
});
