import { paymentsRepository } from "../repositories/payments.repository";
import { Payment, NewPayment, payments } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { filterColumns } from "../helpers/filterColumns";
import { generateId } from "../helpers/generateId";

export const paymentsManager = {
  async list(): Promise<Payment[]> {
    return paymentsRepository.list();
  },
  async getById(id: string): Promise<Payment> {
    const row = await paymentsRepository.getById(id);
    if (!row) throw new NotFoundError();
    return row;
  },
  async create(body: Record<string, unknown>): Promise<Payment> {
    const values = filterColumns(body, payments) as NewPayment;
    values.id = await generateId(payments, "payments", payments.id);
    return paymentsRepository.create(values);
  },
  async update(id: string, body: Record<string, unknown>): Promise<Payment> {
    const values = filterColumns(body, payments) as NewPayment;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    const row = await paymentsRepository.update(id, values);
    if (!row) throw new NotFoundError();
    return row;
  },
  async remove(id: string): Promise<void> {
    const row = await paymentsRepository.remove(id);
    if (!row) throw new NotFoundError();
  },
};
