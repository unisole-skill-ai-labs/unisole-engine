import { branchesRepository } from "../repositories/branches.repository";
import { Branch, NewBranch } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";

export const branchesService = {
  async list(): Promise<Branch[]> {
    return branchesRepository.list();
  },

  async listActive(): Promise<Branch[]> {
    return branchesRepository.listActive();
  },

  async getById(id: string): Promise<Branch> {
    const branch = await branchesRepository.getById(id);
    if (!branch) throw new NotFoundError("Branch not found");
    return branch;
  },

  async create(body: Record<string, unknown>): Promise<Branch> {
    const { name, code, description, isActive } = body as any;
    if (!name || typeof name !== "string" || !name.trim()) {
      throw new ValidationError("Branch name is required");
    }

    return branchesRepository.create({
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
