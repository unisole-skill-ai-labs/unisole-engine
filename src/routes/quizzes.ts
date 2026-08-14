import { Router } from "express";
import { createCrudRouter } from "../crud";
import { quizzes } from "../db/schema";

export const quizzesRouter: Router = createCrudRouter({
  table: quizzes,
});
