import { eq, and, desc } from "drizzle-orm";
import { db } from "../db";
import { offeringsPricing, OfferingPricing, NewOfferingPricing, ItemType } from "../db/schema";

export const pricingRepository = {
  async listAll(options: { isPublicOnly?: boolean; itemType?: ItemType } = {}): Promise<OfferingPricing[]> {
    const conditions = [];
    if (options.isPublicOnly) {
      conditions.push(eq(offeringsPricing.isPublic, true));
      conditions.push(eq(offeringsPricing.isActive, true));
    }
    if (options.itemType) {
      conditions.push(eq(offeringsPricing.itemType, options.itemType));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    return db
      .select()
      .from(offeringsPricing)
      .where(whereClause)
      .orderBy(desc(offeringsPricing.createdAt));
  },

  async getById(id: string): Promise<OfferingPricing | null> {
    const rows = await db.select().from(offeringsPricing).where(eq(offeringsPricing.id, id)).limit(1);
    return rows[0] ?? null;
  },

  async getByItem(itemType: ItemType, itemId: string): Promise<OfferingPricing | null> {
    const rows = await db
      .select()
      .from(offeringsPricing)
      .where(
        and(
          eq(offeringsPricing.itemType, itemType),
          eq(offeringsPricing.itemId, itemId)
        )
      )
      .limit(1);
    return rows[0] ?? null;
  },

  async upsert(data: NewOfferingPricing): Promise<OfferingPricing> {
    const [row] = await db
      .insert(offeringsPricing)
      .values(data)
      .onConflictDoUpdate({
        target: [offeringsPricing.itemType, offeringsPricing.itemId],
        set: {
          title: data.title,
          description: data.description,
          pricePaise: data.pricePaise,
          mrpPaise: data.mrpPaise,
          currency: data.currency || "INR",
          isActive: data.isActive ?? true,
          isPublic: data.isPublic ?? true,
          metadata: data.metadata || {},
          updatedAt: new Date().toISOString(),
        },
      })
      .returning();
    return row;
  },

  async update(id: string, data: Partial<Omit<NewOfferingPricing, "id">>): Promise<OfferingPricing | null> {
    const [row] = await db
      .update(offeringsPricing)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(offeringsPricing.id, id))
      .returning();
    return row ?? null;
  },

  async remove(id: string): Promise<OfferingPricing | null> {
    const [row] = await db.delete(offeringsPricing).where(eq(offeringsPricing.id, id)).returning();
    return row ?? null;
  },
};

