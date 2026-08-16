import { enrollmentsRepository } from "../repositories/enrollments.repository";
import { Enrollment, NewEnrollment, enrollments } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { filterColumns } from "../helpers/filterColumns";

export const enrollmentsManager = {
  async list(): Promise<Enrollment[]> {
    return enrollmentsRepository.list();
  },
  async getById(id: string): Promise<Enrollment> {
    const row = await enrollmentsRepository.getById(id);
    if (!row) throw new NotFoundError();
    return row;
  },
  async create(body: Record<string, unknown>): Promise<Enrollment> {
    const values = filterColumns(body, enrollments) as NewEnrollment;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    return enrollmentsRepository.create(values);
  },
  async update(id: string, body: Record<string, unknown>): Promise<Enrollment> {
    const values = filterColumns(body, enrollments) as NewEnrollment;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    const row = await enrollmentsRepository.update(id, values);
    if (!row) throw new NotFoundError();
    return row;
  },
  async remove(id: string): Promise<void> {
    const row = await enrollmentsRepository.remove(id);
    if (!row) throw new NotFoundError();
  },
};
