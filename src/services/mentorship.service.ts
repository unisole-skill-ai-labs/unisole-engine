import { db } from "../db";
import { mentors, mentorMentees, users } from "../db/schema";
import { eq, and, sql, inArray } from "drizzle-orm";
import { NotFoundError, ValidationError } from "../errors";

export interface MentorProfile {
  id: string;
  userId: string;
  name: string;
  email: string | null;
  phone: string;
  avatar: string | null;
  specialization: string | null;
  bio: string | null;
  officeHours: string | null;
  isActive: boolean;
  activeMenteesCount: number;
}

export const mentorshipService = {
  /**
   * Retrieve all active mentors along with their current active mentee count.
   * Automatically synchronizes any users with role = 'MENTOR' into the mentors table.
   */
  async listMentors(): Promise<MentorProfile[]> {
    // 1. Auto-sync users having role = 'MENTOR' into mentors table if not already present
    const mentorRoleUsers = await db
      .select()
      .from(users)
      .where(sql`role::text = 'MENTOR' OR metadata->'roles' ? 'MENTOR'`);

    for (const u of mentorRoleUsers) {
      const existing = await db
        .select()
        .from(mentors)
        .where(eq(mentors.userId, u.id))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(mentors).values({
          id: `mnt_${u.id}`,
          userId: u.id,
          specialization: u.designation || "Technical Mentor & Project Evaluator",
          bio: "Senior technical mentor guiding student capstone projects and assessments.",
          isActive: u.isActive,
        });
      }
    }

    // 2. Query all mentors joined with users table and compute active mentees count
    const result = await db.execute<any>(sql`
      SELECT 
        m.id,
        m.user_id as "userId",
        u.name,
        u.email,
        u.phone,
        u.avatar,
        COALESCE(m.specialization, u.designation, 'Technical Mentor') as specialization,
        m.bio,
        m.office_hours as "officeHours",
        m.is_active as "isActive",
        COALESCE(
          (
            SELECT COUNT(DISTINCT mm.mentee_id)
            FROM mentor_mentees mm
            WHERE mm.mentor_id = m.id AND mm.status = 'ACTIVE'
          ),
          0
        )::int as "activeMenteesCount"
      FROM mentors m
      JOIN users u ON u.id = m.user_id
      ORDER BY m.created_at ASC;
    `);

    const rows = result.rows || result;
    return rows.map((r: any) => ({
      id: r.id,
      userId: r.userId,
      name: r.name || "Mentor",
      email: r.email,
      phone: r.phone,
      avatar: r.avatar,
      specialization: r.specialization,
      bio: r.bio,
      officeHours: r.officeHours,
      isActive: Boolean(r.isActive),
      activeMenteesCount: Number(r.activeMenteesCount || 0),
    }));
  },

  /**
   * List mentorship mappings with filters
   */
  async listMentorships(filters?: {
    mentorId?: string;
    courseId?: string;
    menteeId?: string;
  }) {
    const whereClauses: any[] = [sql`mm.status = 'ACTIVE'`];

    if (filters?.mentorId) {
      whereClauses.push(sql`(mm.mentor_id = ${filters.mentorId} OR m.user_id = ${filters.mentorId})`);
    }
    if (filters?.courseId) {
      whereClauses.push(sql`mm.course_id = ${filters.courseId}`);
    }
    if (filters?.menteeId) {
      whereClauses.push(sql`mm.mentee_id = ${filters.menteeId}`);
    }

    const whereSql = sql`WHERE ${sql.join(whereClauses, sql` AND `)}`;

    const result = await db.execute<any>(sql`
      SELECT 
        mm.id,
        mm.mentor_id as "mentorId",
        mm.mentee_id as "menteeId",
        mm.course_id as "courseId",
        mm.pathway_id as "pathwayId",
        mm.status,
        mm.assigned_at as "assignedAt",
        u_mentee.name as "menteeName",
        u_mentee.email as "menteeEmail",
        u_mentee.phone as "menteePhone",
        u_mentee.college_name as "menteeCollegeName",
        u_mentor.name as "mentorName",
        u_mentor.email as "mentorEmail",
        m.specialization as "mentorSpecialization",
        COALESCE(c.title, p.title, mm.course_id) as "courseTitle"
      FROM mentor_mentees mm
      JOIN mentors m ON m.id = mm.mentor_id
      JOIN users u_mentor ON u_mentor.id = m.user_id
      JOIN users u_mentee ON u_mentee.id = mm.mentee_id
      LEFT JOIN courses c ON c.id = mm.course_id
      LEFT JOIN pathways p ON p.id = mm.pathway_id
      ${whereSql}
      ORDER BY mm.assigned_at DESC;
    `);

    return result.rows || result;
  },

  /**
   * Assign one or more mentees to a mentor (Admin only).
   * Reassigns existing active allocations cleanly.
   */
  async assignMentor(data: {
    mentorId: string;
    menteeIds: string[];
    courseId?: string | null;
    pathwayId?: string | null;
    adminUserId?: string;
  }) {
    if (!data.mentorId) {
      throw new ValidationError("Mentor ID is required");
    }
    if (!Array.isArray(data.menteeIds) || data.menteeIds.length === 0) {
      throw new ValidationError("At least one mentee ID must be provided");
    }

    // Resolve mentor record (support either mentors.id or mentors.user_id)
    let mentorRecord = await db
      .select()
      .from(mentors)
      .where(eq(mentors.id, data.mentorId))
      .limit(1);

    if (mentorRecord.length === 0) {
      mentorRecord = await db
        .select()
        .from(mentors)
        .where(eq(mentors.userId, data.mentorId))
        .limit(1);
    }

    // If still not found, check if it's a valid user with role = 'MENTOR' and auto-create
    if (mentorRecord.length === 0) {
      const userRec = await db
        .select()
        .from(users)
        .where(eq(users.id, data.mentorId))
        .limit(1);

      if (userRec.length > 0 && (userRec[0].role === "MENTOR" || userRec[0].role === "ADMIN" || userRec[0].role === "SUPER_ADMIN")) {
        const newMentorId = `mnt_${userRec[0].id}`;
        const created = await db
          .insert(mentors)
          .values({
            id: newMentorId,
            userId: userRec[0].id,
            specialization: userRec[0].designation || "Technical Mentor",
            bio: "Mentor guiding capstone assessments and technical labs.",
            isActive: true,
          })
          .returning();
        mentorRecord = created;
      }
    }

    if (mentorRecord.length === 0) {
      throw new NotFoundError(`Mentor record not found for '${data.mentorId}'`);
    }

    const resolvedMentorId = mentorRecord[0].id;
    const targetCourseId = data.courseId || null;
    const targetPathwayId = data.pathwayId || null;
    const assignedRecords: any[] = [];

    for (const menteeId of data.menteeIds) {
      // Check if mentee exists
      const menteeUser = await db
        .select()
        .from(users)
        .where(eq(users.id, menteeId))
        .limit(1);

      if (menteeUser.length === 0) continue;

      // Check existing active assignment for this mentee and course
      let existingQuery = sql`
        SELECT id FROM mentor_mentees 
        WHERE mentee_id = ${menteeId} AND status = 'ACTIVE'
      `;
      if (targetCourseId) {
        existingQuery = sql`
          SELECT id FROM mentor_mentees 
          WHERE mentee_id = ${menteeId} AND course_id = ${targetCourseId} AND status = 'ACTIVE'
        `;
      }

      const existingRes = await db.execute<any>(existingQuery);
      const existingRows = existingRes.rows || existingRes;

      if (existingRows.length > 0) {
        // Update existing mapping with new mentor
        const existingId = existingRows[0].id;
        const updated = await db
          .update(mentorMentees)
          .set({
            mentorId: resolvedMentorId,
            courseId: targetCourseId,
            pathwayId: targetPathwayId,
            status: "ACTIVE",
            updatedAt: new Date().toISOString(),
          })
          .where(eq(mentorMentees.id, existingId))
          .returning();
        assignedRecords.push(updated[0]);
      } else {
        // Insert new assignment
        const newId = `mm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const inserted = await db
          .insert(mentorMentees)
          .values({
            id: newId,
            mentorId: resolvedMentorId,
            menteeId,
            courseId: targetCourseId,
            pathwayId: targetPathwayId,
            status: "ACTIVE",
          })
          .returning();
        assignedRecords.push(inserted[0]);
      }
    }

    return {
      success: true,
      mentorId: resolvedMentorId,
      assignedCount: assignedRecords.length,
      records: assignedRecords,
    };
  },

  /**
   * Unassign a mentee (Admin only)
   */
  async unassignMentor(data: {
    mappingId?: string;
    menteeId?: string;
    courseId?: string;
  }) {
    if (data.mappingId) {
      await db
        .update(mentorMentees)
        .set({ status: "INACTIVE", updatedAt: new Date().toISOString() })
        .where(eq(mentorMentees.id, data.mappingId));
      return { success: true, mappingId: data.mappingId };
    }

    if (data.menteeId) {
      let query = sql`
        UPDATE mentor_mentees 
        SET status = 'INACTIVE', updated_at = NOW() 
        WHERE mentee_id = ${data.menteeId}
      `;
      if (data.courseId) {
        query = sql`
          UPDATE mentor_mentees 
          SET status = 'INACTIVE', updated_at = NOW() 
          WHERE mentee_id = ${data.menteeId} AND course_id = ${data.courseId}
        `;
      }
      await db.execute(query);
      return { success: true, menteeId: data.menteeId };
    }

    throw new ValidationError("Either mappingId or menteeId must be provided");
  },
};
