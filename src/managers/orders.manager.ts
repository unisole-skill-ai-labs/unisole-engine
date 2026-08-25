import { ordersRepository } from "../repositories/orders.repository";
import { Order, NewOrder, orders } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { filterColumns } from "../helpers/filterColumns";
import { generateId } from "../helpers/generateId";

export const ordersManager = {
  async list(
    user?: { id: string; role: string },
    options: { userId?: string } = {}
  ): Promise<Order[]> {
    if (!user) return [];

    if (user.role === "admin") {
      if (options.userId) {
        return ordersRepository.listByUser(options.userId);
      }
      return ordersRepository.list();
    }

    return ordersRepository.listByUser(user.id);
  },
  async getById(id: string, user?: { id: string; role: string }): Promise<Order> {
    const row = await ordersRepository.getById(id);
    if (!row) throw new NotFoundError();
    if (user && user.role !== "admin" && row.user_id !== user.id) {
      throw new NotFoundError();
    }
    return row;
  },
  async create(body: Record<string, unknown>, user?: { id: string; role: string }): Promise<Order> {
    const targetUserId = (body.user_id as string) || user?.id;
    if (!targetUserId) {
      throw new ValidationError("user_id is required");
    }
    if (user && user.role !== "admin" && targetUserId !== user.id) {
      throw new ValidationError("Cannot create order for another user");
    }
    const values = filterColumns({ ...body, user_id: targetUserId }, orders) as NewOrder;
    values.id = await generateId(orders, "orders", orders.id);
    return ordersRepository.create(values);
  },
  async update(id: string, body: Record<string, unknown>, user?: { id: string; role: string }): Promise<Order> {
    const existing = await ordersRepository.getById(id);
    if (!existing) throw new NotFoundError();
    if (user && user.role !== "admin" && existing.user_id !== user.id) {
      throw new NotFoundError();
    }
    const values = filterColumns(body, orders) as NewOrder;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    const row = await ordersRepository.update(id, values);
    if (!row) throw new NotFoundError();
    return row;
  },
  async remove(id: string, user?: { id: string; role: string }): Promise<void> {
    const existing = await ordersRepository.getById(id);
    if (!existing) throw new NotFoundError();
    if (user && user.role !== "admin" && existing.user_id !== user.id) {
      throw new NotFoundError();
    }
    const row = await ordersRepository.remove(id);
    if (!row) throw new NotFoundError();
  },
};
