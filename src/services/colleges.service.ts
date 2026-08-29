import { collegesRepository } from "../repositories/colleges.repository";
import { College, NewCollege } from "../db/schema";
import { NotFoundError, ValidationError, ConflictError } from "../errors";

export const collegesService = {
  async list(): Promise<College[]> {
    return collegesRepository.list();
  },

  async listActive(): Promise<College[]> {
    const all = await collegesRepository.list();
    return all.filter((c) => c.isActive);
  },

  async getById(id: string): Promise<College> {
    const college = await collegesRepository.getById(id);
    if (!college) throw new NotFoundError("College not found");
    return college;
  },

  async getBySlug(slug: string): Promise<College> {
    const college = await collegesRepository.getBySlug(slug);
    if (!college) throw new NotFoundError("College not found");
    return college;
  },

  async create(body: Record<string, unknown>): Promise<College> {
    const { name, slug, shortName, description } = body as any;
    if (!name || !slug) throw new ValidationError("name and slug are required");

    const existing = await collegesRepository.getBySlug(slug);
    if (existing) throw new ConflictError("A college with this slug already exists");

    return collegesRepository.create({
      name,
      slug,
      shortName: shortName || null,
      description: description || null,
    });
  },

  async update(id: string, body: Record<string, unknown>): Promise<College> {
    const existing = await collegesRepository.getById(id);
    if (!existing) throw new NotFoundError("College not found");

    const data: Partial<NewCollege> = {};
    if (body.name !== undefined) data.name = body.name as string;
    if (body.slug !== undefined) data.slug = body.slug as string;
    if (body.shortName !== undefined) data.shortName = body.shortName as string;
    if (body.description !== undefined) data.description = body.description as string;
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

    if (Object.keys(data).length === 0) throw new ValidationError("No valid fields provided");

    const updated = await collegesRepository.update(id, data);
    if (!updated) throw new NotFoundError("College not found");
    return updated;
  },

  async getCollegeAnalytics(id: string) {
    let college = await collegesRepository.getById(id);
    if (!college) {
      // Try by slug as fallback
      college = await collegesRepository.getBySlug(id);
    }
    if (!college) throw new NotFoundError("University/College not found");

    // 1. Fetch related data
    const collegeBranches = await collegesRepository.getCollegeBranches(college.id);
    const sessions = await collegesRepository.getCollegeSessions(college.id, college.name);
    const sessionIds = sessions.map((s) => s.id);
    const leads = await collegesRepository.getCollegeLeads(college.id, sessionIds);
    const students = await collegesRepository.getCollegeStudents(college.id, college.name);
    const studentIds = students.map((s) => s.id);
    const enrollments = await collegesRepository.getStudentsEnrollments(studentIds);

    // 2. Aggregate Overview KPIs
    const totalDecksGiven = sessions.length;
    const totalLeadsCaptured = leads.length;
    const enrolledUserIds = new Set(enrollments.map((e) => e.userId));
    const totalLearnersEnrolled = enrolledUserIds.size;
    const totalEnrollmentsCount = enrollments.length;
    const totalBranchesCount = collegeBranches.filter((b) => b.isActive).length;

    const totalPoints = leads.reduce((sum, l) => sum + (l.totalScore || 0), 0);
    const averageQuizScore = totalLeadsCaptured > 0 ? Math.round(totalPoints / totalLeadsCaptured) : 0;
    const topScorer = leads.length > 0 ? leads[0] : null;

    // 3. Compute Branch-by-Branch Breakdown
    const branchBreakdown: any[] = [];
    const matchedLeadIds = new Set<string>();

    for (const b of collegeBranches) {
      const bNameLower = b.name.toLowerCase();
      const bCodeLower = (b.code || "").toLowerCase();

      const branchLeads = leads.filter((l) => {
        const leadBranch = (l.branch || "").toLowerCase();
        if (!leadBranch) return false;
        const matches =
          leadBranch.includes(bNameLower) ||
          bNameLower.includes(leadBranch) ||
          (bCodeLower && leadBranch.includes(bCodeLower));
        if (matches) matchedLeadIds.add(l.id);
        return matches;
      });

      const branchStudents = students.filter((s) => {
        const studentBranch = (s.branch || "").toLowerCase();
        if (!studentBranch) return false;
        return (
          studentBranch.includes(bNameLower) ||
          bNameLower.includes(studentBranch) ||
          (bCodeLower && studentBranch.includes(bCodeLower))
        );
      });
      const branchStudentIds = new Set(branchStudents.map((s) => s.id));
      const branchEnrollments = enrollments.filter((e) => e.userId && branchStudentIds.has(e.userId));

      const bLeadsCount = branchLeads.length;
      const bPoints = branchLeads.reduce((sum, l) => sum + (l.totalScore || 0), 0);
      const bAvgScore = bLeadsCount > 0 ? Math.round(bPoints / bLeadsCount) : 0;
      const participationPercentage =
        totalLeadsCaptured > 0 ? Math.round((bLeadsCount / totalLeadsCaptured) * 100) : 0;

      branchBreakdown.push({
        id: b.id,
        name: b.name,
        code: b.code,
        description: b.description,
        isActive: b.isActive,
        leadsCount: bLeadsCount,
        participationPercentage,
        enrollmentsCount: branchEnrollments.length,
        studentsCount: branchStudents.length,
        averageScore: bAvgScore,
      });
    }

    // Account for uncategorized / other branches in leads
    const unmatchedLeads = leads.filter((l) => !matchedLeadIds.has(l.id));
    if (unmatchedLeads.length > 0) {
      const unPoints = unmatchedLeads.reduce((sum, l) => sum + (l.totalScore || 0), 0);
      branchBreakdown.push({
        id: "other",
        name: "Other / Multidisciplinary",
        code: "OTHER",
        description: "Students from additional streams or unmapped departments",
        isActive: true,
        leadsCount: unmatchedLeads.length,
        participationPercentage:
          totalLeadsCaptured > 0 ? Math.round((unmatchedLeads.length / totalLeadsCaptured) * 100) : 0,
        enrollmentsCount: 0,
        studentsCount: 0,
        averageScore: Math.round(unPoints / unmatchedLeads.length),
      });
    }

    // 4. Map Enrolled Students with Pathway summaries
    const enrolledStudentsMap = new Map<string, any>();
    for (const student of students) {
      const studentEnrollments = enrollments.filter((e) => e.userId === student.id);
      enrolledStudentsMap.set(student.id, {
        ...student,
        enrollments: studentEnrollments,
        enrolledCount: studentEnrollments.length,
      });
    }

    return {
      college,
      stats: {
        totalDecksGiven,
        totalLeadsCaptured,
        totalLearnersEnrolled,
        totalEnrollmentsCount,
        totalBranchesCount,
        averageQuizScore,
        topScorer,
      },
      branchBreakdown,
      sessions,
      recentLeads: leads.slice(0, 100),
      enrolledStudents: Array.from(enrolledStudentsMap.values()),
    };
  },
};
