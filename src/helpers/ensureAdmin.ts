import { hashSync } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";

export async function ensureDefaultAdmin() {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@unisole.test").toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || "password123";

    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    const now = new Date();
    const passwordHash = hashSync(adminPassword, 10);

    if (existingAdmin.length === 0) {
      await db.insert(users).values({
        id: "usr_admin_default",
        name: "Admin User",
        email: adminEmail,
        phone: "0000000000",
        password_hash: passwordHash,
        role: "admin",
        auth_provider: "local",
        is_verified: true,
        created_at: now,
        updated_at: now,
      });
      console.log(`[Auth] Default admin ensured: ${adminEmail}`);
    } else if (existingAdmin[0].role !== "admin") {
      await db
        .update(users)
        .set({
          role: "admin",
          updated_at: now,
        })
        .where(eq(users.email, adminEmail));
      console.log(`[Auth] Promoted ${adminEmail} to admin role`);
    }
  } catch (err) {
    console.error("[Auth] Error ensuring default admin user:", err);
  }
}
