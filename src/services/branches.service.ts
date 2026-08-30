import { branchesRepository } from "../repositories/branches.repository";
import { collegesRepository } from "../repositories/colleges.repository";
import { Branch, NewBranch } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";

export const branchesService = {
  async list(collegeId?: string): Promise<any[]> {
    let resolvedCollegeId = collegeId;
    if (collegeId) {
      const col = (await collegesRepository.getById(collegeId)) || (await collegesRepository.getBySlug(collegeId));
      if (col) resolvedCollegeId = col.id;
    }

    const list = await branchesRepository.list(resolvedCollegeId);
    let allStudents: any[] = [];
    try {
      allStudents = await collegesRepository.getAllStudents();
    } catch (err) {
      console.warn("[branchesService.list] students fetch warning:", err);
    }

    return (list || []).map((b) => {
      const bNameLower = b.name.toLowerCase();
      const bCodeLower = (b.code || "").toLowerCase();
      const count = (allStudents || []).filter((s) => {
        if (resolvedCollegeId && s.collegeId && s.collegeId !== resolvedCollegeId) return false;
        if (!resolvedCollegeId && b.collegeId && s.collegeId && s.collegeId !== b.collegeId) return false;
        const studentBranch = (s.branch || "").toLowerCase();
        if (!studentBranch) return false;
        return (
          studentBranch === bNameLower ||
          studentBranch.includes(bNameLower) ||
          bNameLower.includes(studentBranch) ||
          (bCodeLower && studentBranch.includes(bCodeLower))
        );
      }).length;

      return {
        ...b,
        studentsCount: count,
      };
    });
  },

  async listActive(collegeId?: string): Promise<any[]> {
    const all = await this.list(collegeId);
    return all.filter((b) => b.isActive);
  },

  async getById(id: string): Promise<Branch> {
    const branch = await branchesRepository.getById(id);
    if (!branch) throw new NotFoundError("Branch not found");
    return branch;
  },

  async create(body: Record<string, unknown>): Promise<Branch> {
    const { name, code, description, isActive, collegeId } = body as any;
    if (!name || typeof name !== "string" || !name.trim()) {
      throw new ValidationError("Branch name is required");
    }
    if (!collegeId || typeof collegeId !== "string" || !collegeId.trim()) {
      throw new ValidationError("College is required for branch creation");
    }

    const trimmedCollegeId = String(collegeId).trim();
    const college = (await collegesRepository.getById(trimmedCollegeId)) || (await collegesRepository.getBySlug(trimmedCollegeId));
    if (!college) {
      throw new NotFoundError(`College with ID "${collegeId}" does not exist. Please refresh the page or select a valid institution.`);
    }

    return branchesRepository.create({
      collegeId: college.id,
      name: name.trim(),
      code: code ? String(code).trim().toUpperCase() : null,
      description: description ? String(description).trim() : null,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });
  },

  async update(id: string, body: Record<string, unknown>): Promise<Branch> {
    const existing = await branchesRepository.getById(id);
    if (!existing) throw new NotFoundError("Branch not found");

    const data: Partial<NewBranch> = {};
    if (body.collegeId !== undefined && body.collegeId) data.collegeId = String(body.collegeId).trim();
    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.code !== undefined) data.code = body.code ? String(body.code).trim().toUpperCase() : null;
    if (body.description !== undefined) data.description = body.description ? String(body.description).trim() : null;
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

    if (Object.keys(data).length === 0) throw new ValidationError("No valid fields provided");

    const updated = await branchesRepository.update(id, data);
    if (!updated) throw new NotFoundError("Branch not found");
    return updated;
  },

  async remove(id: string): Promise<Branch> {
    const existing = await branchesRepository.getById(id);
    if (!existing) throw new NotFoundError("Branch not found");

    const deleted = await branchesRepository.remove(id);
    if (!deleted) throw new NotFoundError("Branch not found");
    return deleted;
  },
};
