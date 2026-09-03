import { db } from "../db";
import { iaptNainRegistrations, users } from "../db/schema";
import { eq, desc } from "drizzle-orm";

export interface RegisterNainDto {
  category: string;
  institution: string;
  cityState: string;
}

export class IaptService {
  /**
   * Register or update NAIN registration for the authenticated user
   */
  async registerNain(userId: string, data: RegisterNainDto) {
    if (!data.category || !data.institution || !data.cityState) {
      throw new Error("Category, institution, and city/state are required");
    }

    // Fetch user details to snapshot name and phone
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        phone: users.phone,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error("Authenticated user not found");
    }

    const userName = user.name?.trim() || "Participant";
    const userPhone = user.phone;

    // Check if user has an existing NAIN registration
    const [existing] = await db
      .select()
      .from(iaptNainRegistrations)
      .where(eq(iaptNainRegistrations.userId, userId))
      .limit(1);

    if (existing) {
      // Update existing registration (upsert behavior)
      const [updated] = await db
        .update(iaptNainRegistrations)
        .set({
          name: userName,
          phone: userPhone,
          category: data.category.trim(),
          institution: data.institution.trim(),
          cityState: data.cityState.trim(),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(iaptNainRegistrations.id, existing.id))
        .returning();

      return {
        isNew: false,
        registration: updated,
      };
    }

    // Insert new registration
    const [inserted] = await db
      .insert(iaptNainRegistrations)
      .values({
        userId,
        name: userName,
        phone: userPhone,
        category: data.category.trim(),
        institution: data.institution.trim(),
        cityState: data.cityState.trim(),
      })
      .returning();

    return {
      isNew: true,
      registration: inserted,
    };
  }

  /**
   * Get NAIN registration details for the authenticated user
   */
  async getMyRegistration(userId: string) {
    const [registration] = await db
      .select()
      .from(iaptNainRegistrations)
      .where(eq(iaptNainRegistrations.userId, userId))
      .limit(1);

    return registration || null;
  }

  /**
   * List all NAIN registrations (for admin reporting)
   */
  async getAllRegistrations(limit = 100, offset = 0) {
    return db
      .select()
      .from(iaptNainRegistrations)
      .orderBy(desc(iaptNainRegistrations.createdAt))
      .limit(limit)
      .offset(offset);
  }
}

export const iaptService = new IaptService();
