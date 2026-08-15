import { assignmentSubmissionsRepository } from "../repositories/assignmentSubmissions.repository";
import {
  AssignmentSubmission,
  NewAssignmentSubmission,
  assignmentSubmissions,
} from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { filterColumns } from "../helpers/filterColumns";

export const assignmentSubmissionsManager = {
  async list(): Promise<AssignmentSubmission[]> {
    return assignmentSubmissionsRepository.list();
  },
  async getById(id: string): Promise<AssignmentSubmission> {
    const row = await assignmentSubmissionsRepository.getById(id);
    if (!row) throw new NotFoundError();
    return row;
  },
  async create(
    body: Record<string, unknown>
  ): Promise<AssignmentSubmission> {
    const values = filterColumns(
      body,
      assignmentSubmissions
    ) as NewAssignmentSubmission;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    return assignmentSubmissionsRepository.create(values);
  },
  async update(
    id: string,
    body: Record<string, unknown>
  ): Promise<AssignmentSubmission> {
    const values = filterColumns(
      body,
      assignmentSubmissions
    ) as NewAssignmentSubmission;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    const row = await assignmentSubmissionsRepository.update(id, values);
    if (!row) throw new NotFoundError();
    return row;
  },
  async remove(id: string): Promise<void> {
    const row = await assignmentSubmissionsRepository.remove(id);
    if (!row) throw new NotFoundError();
  },
};
