import { Request, Response } from "express";
import { asyncHandler } from "../middleware/async-handler";
import { surveysService } from "../services/surveys.service";
import { CustomRequest } from "../middleware/auth";

export const surveysController = {
  // Public
  getPublicSurvey: asyncHandler(async (req: Request, res: Response) => {
    const slug = req.params.slug;
    const result = await surveysService.getPublicSurvey(slug);
    res.status(200).json(result);
  }),

  submitSurvey: asyncHandler(async (req: Request, res: Response) => {
    const slug = req.params.slug;
    const metadata = {
      ip: req.ip || req.headers["x-forwarded-for"] || "",
      userAgent: req.headers["user-agent"] || "",
      referrer: req.headers["referer"] || "",
    };

    const result = await surveysService.submitSurvey(slug, {
      ...req.body,
      metadata: {
        ...metadata,
        ...(req.body.metadata || {}),
      },
    });
    res.status(201).json(result);
  }),

  // Admin
  listSurveys: asyncHandler(async (req: CustomRequest, res: Response) => {
    const result = await surveysService.listSurveys();
    res.status(200).json(result);
  }),

  getSurveyDetail: asyncHandler(async (req: CustomRequest, res: Response) => {
    const slug = req.params.slug;
    const result = await surveysService.getSurveyDetail(slug);
    res.status(200).json(result);
  }),

  updateSurvey: asyncHandler(async (req: CustomRequest, res: Response) => {
    const slug = req.params.slug;
    const result = await surveysService.updateSurvey(slug, req.body);
    res.status(200).json(result);
  }),

  listResponses: asyncHandler(async (req: CustomRequest, res: Response) => {
    const slug = req.params.slug;
    const { collegeName, stream, yearOfStudy, search, limit, offset } = req.query;

    const result = await surveysService.listResponses(slug, {
      collegeName: collegeName as string | undefined,
      stream: stream as string | undefined,
      yearOfStudy: yearOfStudy as string | undefined,
      search: search as string | undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
    });
    res.status(200).json(result);
  }),

  getStats: asyncHandler(async (req: CustomRequest, res: Response) => {
    const slug = req.params.slug;
    const result = await surveysService.getStats(slug);
    res.status(200).json(result);
  }),

  exportCsv: asyncHandler(async (req: CustomRequest, res: Response) => {
    const slug = req.params.slug;
    const csvContent = await surveysService.exportCsv(slug);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${slug}-responses.csv"`);
    res.status(200).send(csvContent);
  }),
};
