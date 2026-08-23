import { hashSync } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, pool } from "../db";
import { users } from "../db/schema";

async function createAdmin() {
  const email = (process.argv[2] || process.env.ADMIN_EMAIL || "admin@unisole.test").toLowerCase().trim();
  const password = process.argv[3] || process.env.ADMIN_PASSWORD || "password123";
  const name = process.argv[4] || "Admin User";

  try {
    const passwordHash = hashSync(password, 10);
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existing.length === 0) {
      const id = `usr_admin_${Date.now()}`;
      await db.insert(users).values({
        id,
        name,
        email,
        phone: "0000000000",
        password_hash: passwordHash,
        role: "admin",
        auth_provider: "local",
        is_verified: true,
      });
      console.log(`\n✓ Admin user created successfully:`);
    } else {
      await db
        .update(users)
        .set({
          name,
          role: "admin",
          password_hash: passwordHash,
          is_verified: true,
          updated_at: new Date(),
        })
        .where(eq(users.email, email));
      console.log(`\n✓ Admin user updated & password reset successfully:`);
    }

    console.log(`===================================`);
    console.log(` Email:    ${email}`);
    console.log(` Password: ${password}`);
    console.log(` Role:     admin`);
    console.log(`===================================\n`);
  } catch (error) {
    console.error("Error creating/resetting admin:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createAdmin();
