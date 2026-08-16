import { eq } from "drizzle-orm";
import { db } from "../db";
import { Certificate, NewCertificate, certificates } from "../db/schema";

export const certificatesRepository = {
  async list(): Promise<Certificate[]> {
    return await db.select().from(certificates);
  },
  async getById(id: string): Promise<Certificate | undefined> {
    const rows = await db.select().from(certificates).where(eq(certificates.id, id));
    return rows[0];
  },
  async create(values: NewCertificate): Promise<Certificate> {
    const rows = await db.insert(certificates).values(values).returning();
    return rows[0];
  },
  async update(id: string, values: Partial<NewCertificate>): Promise<Certificate | undefined> {
    const rows = await db
      .update(certificates)
      .set(values)
      .where(eq(certificates.id, id))
      .returning();
    return rows[0];
  },
  async remove(id: string): Promise<Certificate | undefined> {
    const rows = await db.delete(certificates).where(eq(certificates.id, id)).returning();
    return rows[0];
  },
};
