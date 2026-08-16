import { eq } from "drizzle-orm";
import { db } from "../db";
import { Review, NewReview, reviews } from "../db/schema";

export const reviewsRepository = {
  async list(): Promise<Review[]> {
    return await db.select().from(reviews);
  },
  async getById(id: string): Promise<Review | undefined> {
    const rows = await db.select().from(reviews).where(eq(reviews.id, id));
    return rows[0];
  },
  async create(values: NewReview): Promise<Review> {
    const rows = await db.insert(reviews).values(values).returning();
    return rows[0];
  },
  async update(id: string, values: Partial<NewReview>): Promise<Review | undefined> {
    const rows = await db
      .update(reviews)
      .set(values)
      .where(eq(reviews.id, id))
      .returning();
    return rows[0];
  },
  async remove(id: string): Promise<Review | undefined> {
    const rows = await db.delete(reviews).where(eq(reviews.id, id)).returning();
    return rows[0];
  },
};
