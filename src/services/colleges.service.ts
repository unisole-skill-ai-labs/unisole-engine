import { collegesRepository } from "../repositories/colleges.repository";
import { College, NewCollege } from "../db/schema";
import { NotFoundError, ValidationError, ConflictError } from "../errors";

export const collegesService = {
  async list(): Promise<any[]> {
    const list = await collegesRepository.list();
    let allBranches: any[] = [];
    let allStudents: any[] = [];

    try {
      allBranches = await collegesRepository.getAllBranches();
    } catch (err) {
      console.warn("[CollegesService] branches fetch warning in list():", err);
    }

    try {
      allStudents = await collegesRepository.getAllStudents();
    } catch (err) {
      console.warn("[CollegesService] students fetch warning in list():", err);
    }

    const branchesCountMap = new Map<string, number>();
    for (const b of (allBranches || [])) {
      if (b && b.collegeId) {
        branchesCountMap.set(b.collegeId, (branchesCountMap.get(b.collegeId) || 0) + 1);
      }
    }

    const studentsCountMap = new Map<string, number>();
    for (const s of (allStudents || [])) {
      if (s && s.collegeId) {
        studentsCountMap.set(s.collegeId, (studentsCountMap.get(s.collegeId) || 0) + 1);
      }
    }

    return (list || []).map((c) => ({
      ...c,
      branchesCount: branchesCountMap.get(c.id) || 0,
      studentsCount: studentsCountMap.get(c.id) || 0,
    }));
  },

  async listActive(): Promise<any[]> {
    const all = await this.list();
    return all.filter((c) => c.isActive);
  },

  async getById(id: string): Promise<any> {
    let college = await collegesRepository.getById(id);
    if (!college) {
      college = await collegesRepository.getBySlug(id);
    }
    if (!college) throw new NotFoundError("College not found");

    let branches: any[] = [];
    let students: any[] = [];
    try {
      branches = await collegesRepository.getCollegeBranches(college.id);
    } catch (err) {
      console.warn("[CollegesService] getCollegeBranches warning:", err);
    }
    try {
      students = await collegesRepository.getCollegeStudents(college.id, college.name);
    } catch (err) {
      console.warn("[CollegesService] getCollegeStudents warning:", err);
    }

    return {
      ...college,
      branches: branches || [],
      students: students || [],
      branchesCount: (branches || []).length,
      studentsCount: (students || []).length,
    };
  },

  async getBySlug(slug: string): Promise<any> {
    return this.getById(slug);
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
    if (Object.keys(data).length === 0) throw new ValidationError("No valid fields provided");

    const updated = await collegesRepository.update(id, data);
    if (!updated) throw new NotFoundError("College not found");
    return updated;
  },

  async remove(id: string): Promise<College> {
    const existing = await collegesRepository.getById(id);
    if (!existing) throw new NotFoundError("College not found");

    const deleted = await collegesRepository.remove(id);
    if (!deleted) throw new NotFoundError("College not found");
    return deleted;
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
    const collegePresentations = await collegesRepository.getCollegePresentations(college.id);
    const sessions = await collegesRepository.getCollegeSessions(college.id, college.name);
    const sessionIds = sessions.map((s) => s.id);
    const leads = await collegesRepository.getCollegeLeads(college.id, sessionIds);
    const students = await collegesRepository.getCollegeStudents(college.id, college.name);
    const studentIds = students.map((s) => s.id);
    const enrollments = await collegesRepository.getStudentsEnrollments(studentIds);

    // 2. Aggregate Overview KPIs
    const totalDecksCount = collegePresentations.length;
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
        totalDecksCount,
        totalDecksGiven,
        totalLeadsCaptured,
        totalLearnersEnrolled,
        totalEnrollmentsCount,
        totalBranchesCount,
        averageQuizScore,
        topScorer,
      },
      branchBreakdown,
      presentations: collegePresentations,
      sessions,
      recentLeads: leads.slice(0, 100),
      enrolledStudents: Array.from(enrolledStudentsMap.values()),
    };
  },

  async getLeadDiversificationReport() {
    const allColleges = await collegesRepository.list().catch((e) => {
      console.warn("[CollegesService] list() catch in report:", e);
      return [];
    });
    const allSessions = await collegesRepository.getAllSessions().catch((e) => {
      console.warn("[CollegesService] getAllSessions() catch in report:", e);
      return [];
    });
    const allLeads = await collegesRepository.getAllLeads().catch((e) => {
      console.warn("[CollegesService] getAllLeads() catch in report:", e);
      return [];
    });
    const allBranches = await collegesRepository.getAllBranches().catch((e) => {
      console.warn("[CollegesService] getAllBranches() catch in report:", e);
      return [];
    });
    const allEnrollments = await collegesRepository.getAllEnrollments().catch((e) => {
      console.warn("[CollegesService] getAllEnrollments() catch in report:", e);
      return [];
    });
    const allStudents = await collegesRepository.getAllStudents().catch((e) => {
      console.warn("[CollegesService] getAllStudents() catch in report:", e);
      return [];
    });

    // Map sessions to colleges
    const sessionMap = new Map<string, (typeof allSessions)[0]>();
    for (const sess of allSessions) {
      sessionMap.set(sess.id, sess);
    }

    // Map user enrollments
    const enrolledUserSet = new Set(allEnrollments.map((e) => e.userId));

    // Map colleges by ID and Name for fast lookup
    const collegeIdMap = new Map<string, (typeof allColleges)[0]>();
    const collegeNameMap = new Map<string, (typeof allColleges)[0]>();
    for (const c of allColleges) {
      collegeIdMap.set(c.id, c);
      collegeNameMap.set(c.name.toLowerCase(), c);
      if (c.shortName) collegeNameMap.set(c.shortName.toLowerCase(), c);
    }

    // Group sessions by college ID
    const collegeSessionsMap = new Map<string, any[]>();
    const unassignedSessions: any[] = [];

    for (const sess of allSessions) {
      let matchedCollegeId = sess.collegeId;
      if (!matchedCollegeId && sess.collegeName) {
        const found = collegeNameMap.get(sess.collegeName.toLowerCase());
        if (found) matchedCollegeId = found.id;
      }

      if (matchedCollegeId && collegeIdMap.has(matchedCollegeId)) {
        const list = collegeSessionsMap.get(matchedCollegeId) || [];
        list.push(sess);
        collegeSessionsMap.set(matchedCollegeId, list);
      } else {
        unassignedSessions.push(sess);
      }
    }

    // Group leads by college ID
    const collegeLeadsMap = new Map<string, any[]>();
    const unassignedLeads: any[] = [];

    for (const lead of allLeads) {
      let matchedCollegeId = lead.collegeId;
      if (!matchedCollegeId && lead.sessionId) {
        const sess = sessionMap.get(lead.sessionId);
        if (sess?.collegeId) {
          matchedCollegeId = sess.collegeId;
        } else if (sess?.collegeName) {
          const found = collegeNameMap.get(sess.collegeName.toLowerCase());
          if (found) matchedCollegeId = found.id;
        }
      }

      if (matchedCollegeId && collegeIdMap.has(matchedCollegeId)) {
        const list = collegeLeadsMap.get(matchedCollegeId) || [];
        list.push(lead);
        collegeLeadsMap.set(matchedCollegeId, list);
      } else {
        unassignedLeads.push(lead);
      }
    }

    // Group students and enrollments by college
    const collegeStudentsMap = new Map<string, any[]>();
    for (const st of allStudents) {
      let matchedCollegeId = st.collegeId;
      if (!matchedCollegeId && st.collegeName) {
        const found = collegeNameMap.get(st.collegeName.toLowerCase());
        if (found) matchedCollegeId = found.id;
      }
      if (matchedCollegeId) {
        const list = collegeStudentsMap.get(matchedCollegeId) || [];
        list.push(st);
        collegeStudentsMap.set(matchedCollegeId, list);
      }
    }

    // Group branches by college ID
    const collegeBranchesMap = new Map<string, any[]>();
    for (const br of allBranches) {
      if (br.collegeId) {
        const list = collegeBranchesMap.get(br.collegeId) || [];
        list.push(br);
        collegeBranchesMap.set(br.collegeId, list);
      }
    }

    // Overall Branch distribution across all colleges
    const globalBranchCountMap = new Map<string, number>();

    // Process each college's diversification data
    const collegeReports: any[] = [];

    for (const college of allColleges) {
      const sessions = collegeSessionsMap.get(college.id) || [];
      const leads = collegeLeadsMap.get(college.id) || [];
      const students = collegeStudentsMap.get(college.id) || [];
      const configuredBranches = collegeBranchesMap.get(college.id) || [];

      const totalLeads = leads.length;
      const sessionsCount = sessions.length;

      // Enrolled learners from this college
      const enrolledStudents = students.filter((s) => enrolledUserSet.has(s.id));
      const enrolledCount = enrolledStudents.length;
      const conversionRate =
        totalLeads > 0 ? Math.round((enrolledCount / totalLeads) * 100) : 0;

      // Quiz and engagement points
      const totalPoints = leads.reduce((sum, l) => sum + (l.totalScore || 0), 0);
      const avgScore = totalLeads > 0 ? Math.round(totalPoints / totalLeads) : 0;
      const topLead =
        leads.length > 0
          ? [...leads].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))[0]
          : null;

      // Branch-by-branch breakdown
      const branchBreakdown: any[] = [];
      const matchedLeadIds = new Set<string>();

      for (const b of configuredBranches) {
        const bNameLower = b.name.toLowerCase();
        const bCodeLower = (b.code || "").toLowerCase();

        const branchLeads = leads.filter((l) => {
          const lBranch = (l.branch || "").toLowerCase();
          if (!lBranch) return false;
          const match =
            lBranch.includes(bNameLower) ||
            bNameLower.includes(lBranch) ||
            (bCodeLower &&
              (lBranch.includes(bCodeLower) || bCodeLower.includes(lBranch)));
          if (match) matchedLeadIds.add(l.id);
          return match;
        });

        const bCount = branchLeads.length;
        const bPoints = branchLeads.reduce((sum, l) => sum + (l.totalScore || 0), 0);
        const bAvg = bCount > 0 ? Math.round(bPoints / bCount) : 0;
        const bPct =
          totalLeads > 0 ? Math.round((bCount / totalLeads) * 100) : 0;

        if (bCount > 0) {
          const curr = globalBranchCountMap.get(b.name) || 0;
          globalBranchCountMap.set(b.name, curr + bCount);
        }

        branchBreakdown.push({
          id: b.id,
          name: b.name,
          code: b.code || b.name.substring(0, 4).toUpperCase(),
          leadsCount: bCount,
          percentage: bPct,
          averageScore: bAvg,
          isActive: b.isActive,
        });
      }

      // Collect any leads whose branch wasn't in configuredBranches
      const remainingLeads = leads.filter((l) => !matchedLeadIds.has(l.id));
      const otherBranchGroupMap = new Map<string, any[]>();

      for (const l of remainingLeads) {
        const rawBranch =
          l.branch && l.branch.trim() ? l.branch.trim() : "Unspecified Branch";
        const group = otherBranchGroupMap.get(rawBranch) || [];
        group.push(l);
        otherBranchGroupMap.set(rawBranch, group);
      }

      for (const [branchName, bLeads] of otherBranchGroupMap.entries()) {
        const bCount = bLeads.length;
        const bPoints = bLeads.reduce((sum, l) => sum + (l.totalScore || 0), 0);
        const bAvg = bCount > 0 ? Math.round(bPoints / bCount) : 0;
        const bPct =
          totalLeads > 0 ? Math.round((bCount / totalLeads) * 100) : 0;

        const curr = globalBranchCountMap.get(branchName) || 0;
        globalBranchCountMap.set(branchName, curr + bCount);

        branchBreakdown.push({
          id: `custom_${branchName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
          name: branchName,
          code: branchName.length <= 6 ? branchName.toUpperCase() : "DEPT",
          leadsCount: bCount,
          percentage: bPct,
          averageScore: bAvg,
          isActive: true,
        });
      }

      // Sort branch breakdown by most leads
      branchBreakdown.sort((a, b) => b.leadsCount - a.leadsCount);

      collegeReports.push({
        college: {
          id: college.id,
          name: college.name,
          slug: college.slug,
          shortName: college.shortName || college.name.split(" ")[0],
          isActive: college.isActive,
          description: college.description,
        },
        sessionsCount,
        totalLeads,
        enrolledCount,
        conversionRate,
        averageScore: avgScore,
        topLead: topLead
          ? {
              name: topLead.name,
              phone: topLead.phone,
              score: topLead.totalScore,
            }
          : null,
        branchesBreakdown: branchBreakdown,
        sessions: sessions.slice(0, 10),
        recentLeads: leads.slice(0, 20),
      });
    }

    // Handle Unassigned / Open Roadshows if any exist
    if (unassignedSessions.length > 0 || unassignedLeads.length > 0) {
      const uTotalLeads = unassignedLeads.length;
      const uPoints = unassignedLeads.reduce(
        (sum, l) => sum + (l.totalScore || 0),
        0
      );
      const uAvg = uTotalLeads > 0 ? Math.round(uPoints / uTotalLeads) : 0;

      const uBranchMap = new Map<string, any[]>();
      for (const l of unassignedLeads) {
        const br =
          l.branch && l.branch.trim() ? l.branch.trim() : "General / Open";
        const group = uBranchMap.get(br) || [];
        group.push(l);
        uBranchMap.set(br, group);
      }

      const uBranchBreakdown: any[] = [];
      for (const [brName, bLeads] of uBranchMap.entries()) {
        const bCount = bLeads.length;
        const bPoints = bLeads.reduce((sum, l) => sum + (l.totalScore || 0), 0);
        uBranchBreakdown.push({
          id: `open_${brName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
          name: brName,
          code: brName.length <= 6 ? brName.toUpperCase() : "OPEN",
          leadsCount: bCount,
          percentage:
            uTotalLeads > 0 ? Math.round((bCount / uTotalLeads) * 100) : 0,
          averageScore: bCount > 0 ? Math.round(bPoints / bCount) : 0,
          isActive: true,
        });
      }
      uBranchBreakdown.sort((a, b) => b.leadsCount - a.leadsCount);

      collegeReports.push({
        college: {
          id: "open_roadshows",
          name: "Open Roadshows & Direct Sessions",
          slug: "open-roadshows",
          shortName: "OPEN",
          isActive: true,
          description:
            "Unassigned or direct audience presentations across non-partner institutions",
        },
        sessionsCount: unassignedSessions.length,
        totalLeads: uTotalLeads,
        enrolledCount: 0,
        conversionRate: 0,
        averageScore: uAvg,
        topLead:
          unassignedLeads.length > 0
            ? {
                name: unassignedLeads[0].name,
                phone: unassignedLeads[0].phone,
                score: unassignedLeads[0].totalScore,
              }
            : null,
        branchesBreakdown: uBranchBreakdown,
        sessions: unassignedSessions.slice(0, 10),
        recentLeads: unassignedLeads.slice(0, 20),
      });
    }

    // Sort college reports by total leads desc
    collegeReports.sort(
      (a, b) =>
        b.totalLeads - a.totalLeads || b.sessionsCount - a.sessionsCount
    );

    // Compute Overall Summary Metrics
    const totalCollegesCovered = collegeReports.filter(
      (c) => c.sessionsCount > 0 || c.totalLeads > 0
    ).length;
    const totalSessionsConducted = allSessions.length;
    const totalLeadsCaptured = allLeads.length;
    const totalEnrolledLearners = enrolledUserSet.size;

    let topCollegeByLeads = { name: "None", count: 0 };
    if (collegeReports.length > 0 && collegeReports[0].totalLeads > 0) {
      topCollegeByLeads = {
        name: collegeReports[0].college.name,
        count: collegeReports[0].totalLeads,
      };
    }

    let topBranchOverall = { name: "Computer Science", count: 0 };
    let maxBranchCount = 0;
    for (const [bName, bCnt] of globalBranchCountMap.entries()) {
      if (bCnt > maxBranchCount) {
        maxBranchCount = bCnt;
        topBranchOverall = { name: bName, count: bCnt };
      }
    }

    // Enrich all leads with college name and session code for master table
    const enrichedMasterLeads = allLeads.map((lead) => {
      const sess = sessionMap.get(lead.sessionId);
      let collegeName = "Open Session";
      if (lead.collegeId && collegeIdMap.has(lead.collegeId)) {
        collegeName = collegeIdMap.get(lead.collegeId)!.name;
      } else if (sess?.collegeName) {
        collegeName = sess.collegeName;
      } else if (sess?.collegeId && collegeIdMap.has(sess.collegeId)) {
        collegeName = collegeIdMap.get(sess.collegeId)!.name;
      }

      return {
        ...lead,
        collegeName,
        sessionCode: sess?.sessionCode || "—",
        sessionTitle: sess?.presentationTitle || "—",
      };
    });

    return {
      summary: {
        totalCollegesCovered,
        totalSessionsConducted,
        totalLeadsCaptured,
        totalEnrolledLearners,
        topCollegeByLeads,
        topBranchOverall,
      },
      colleges: collegeReports,
      masterLeads: enrichedMasterLeads,
    };
  },
};
