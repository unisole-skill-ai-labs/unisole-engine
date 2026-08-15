import { assignmentsRepository } from "../repositories/assignments.repository";
import { Assignment, NewAssignment, assignments } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { filterColumns } from "../helpers/filterColumns";

export const assignmentsManager = {
  async list(): Promise<Assignment[]> {
    return assignmentsRepository.list();
  },
  async getById(id: string): Promise<Assignment> {
    const row = await assignmentsRepository.getById(id);
    if (!row) throw new NotFoundError();
    return row;
  },
  async create(body: Record<string, unknown>): Promise<Assignment> {
    const values = filterColumns(body, assignments) as NewAssignment;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    return assignmentsRepository.create(values);
  },
  async update(
    id: string,
    body: Record<string, unknown>
  ): Promise<Assignment> {
    const values = filterColumns(body, assignments) as NewAssignment;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    const row = await assignmentsRepository.update(id, values);
    if (!row) throw new NotFoundError();
    return row;
  },
  async remove(id: string): Promise<void> {
    const row = await assignmentsRepository.remove(id);
    if (!row) throw new NotFoundError();
  },
};
