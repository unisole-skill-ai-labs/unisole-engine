import { ordersRepository } from "../repositories/orders.repository";
import { Order, NewOrder, orders } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { filterColumns } from "../helpers/filterColumns";
import { generateId } from "../helpers/generateId";

export const ordersManager = {
  async list(): Promise<Order[]> {
    return ordersRepository.list();
  },
  async getById(id: string): Promise<Order> {
    const row = await ordersRepository.getById(id);
    if (!row) throw new NotFoundError();
    return row;
  },
  async create(body: Record<string, unknown>): Promise<Order> {
    const values = filterColumns(body, orders) as NewOrder;
    values.id = await generateId(orders, "orders", orders.id);
    return ordersRepository.create(values);
  },
  async update(id: string, body: Record<string, unknown>): Promise<Order> {
    const values = filterColumns(body, orders) as NewOrder;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    const row = await ordersRepository.update(id, values);
    if (!row) throw new NotFoundError();
    return row;
  },
  async remove(id: string): Promise<void> {
    const row = await ordersRepository.remove(id);
    if (!row) throw new NotFoundError();
  },
};
