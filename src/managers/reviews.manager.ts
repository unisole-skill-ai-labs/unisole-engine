import { reviewsRepository } from "../repositories/reviews.repository";
import { Review, NewReview, reviews } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { filterColumns } from "../helpers/filterColumns";

export const reviewsManager = {
  async list(): Promise<Review[]> {
    return reviewsRepository.list();
  },
  async getById(id: string): Promise<Review> {
    const row = await reviewsRepository.getById(id);
    if (!row) throw new NotFoundError();
    return row;
  },
  async create(body: Record<string, unknown>): Promise<Review> {
    const values = filterColumns(body, reviews) as NewReview;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    return reviewsRepository.create(values);
  },
  async update(id: string, body: Record<string, unknown>): Promise<Review> {
    const values = filterColumns(body, reviews) as NewReview;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    const row = await reviewsRepository.update(id, values);
    if (!row) throw new NotFoundError();
    return row;
  },
  async remove(id: string): Promise<void> {
    const row = await reviewsRepository.remove(id);
    if (!row) throw new NotFoundError();
  },
};
