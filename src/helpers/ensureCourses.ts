import { eq } from "drizzle-orm";
import { db } from "../db";
import { courses, categories } from "../db/schema";

export async function ensureDefaultCourses(): Promise<void> {
  try {
    // 1. Ensure Default Category
    const existingCats = await db.select().from(categories).limit(1);
    let categoryId = existingCats[0]?.id;
    if (!categoryId) {
      const newCat = await db
        .insert(categories)
        .values({
          id: "cat_ai",
          name: "Artificial Intelligence & Engineering",
        })
        .returning();
      categoryId = newCat[0]?.id || "cat_ai";
    }

    // 2. Ensure Standard Courses/Pathways exist
    const standardCourses = [
      {
        id: "crs_4",
        title: "Python for Data Science & Machine Learning",
        slug: "python-data-science-machine-learning",
        category_id: categoryId,
        price: "4999.00",
      },
      {
        id: "crs_2",
        title: "Full Stack Web & Applied AI Systems",
        slug: "full-stack-web-ai",
        category_id: categoryId,
        price: "4999.00",
      },
      {
        id: "crs_science",
        title: "Science & Research Machine Learning",
        slug: "science-research-machine-learning",
        category_id: categoryId,
        price: "4999.00",
      },
      {
        id: "crs_analytics",
        title: "Business Analytics & Applied AI Strategy",
        slug: "business-analytics-applied-ai",
        category_id: categoryId,
        price: "4999.00",
      },
      {
        id: "crs_1",
        title: "Complete TypeScript Bootcamp",
        slug: "complete-typescript-bootcamp",
        category_id: categoryId,
        price: "4999.00",
      },
    ];

    for (const sc of standardCourses) {
      const existing = await db.select().from(courses).where(eq(courses.id, sc.id)).limit(1);
      if (existing.length === 0) {
        await db.insert(courses).values({
          id: sc.id,
          title: sc.title,
          slug: sc.slug,
          category_id: sc.category_id,
          price: sc.price,
          rating_avg: "4.90",
          total_enrollments: 0,
        });
        console.log(`[ensureDefaultCourses] Seeded standard course: ${sc.title} (${sc.id})`);
      }
    }
  } catch (err) {
    console.warn("[ensureDefaultCourses] Warning checking default courses:", err);
  }
}
