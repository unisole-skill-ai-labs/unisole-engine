import { orderItemsRepository } from "../repositories/orderItems.repository";
import { OrderItem, NewOrderItem, orderItems } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { filterColumns } from "../helpers/filterColumns";

export const orderItemsManager = {
  async list(): Promise<OrderItem[]> {
    return orderItemsRepository.list();
  },
  async getById(id: string): Promise<OrderItem> {
    const row = await orderItemsRepository.getById(id);
    if (!row) throw new NotFoundError();
    return row;
  },
  async create(body: Record<string, unknown>): Promise<OrderItem> {
    const values = filterColumns(body, orderItems) as NewOrderItem;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    return orderItemsRepository.create(values);
  },
  async update(id: string, body: Record<string, unknown>): Promise<OrderItem> {
    const values = filterColumns(body, orderItems) as NewOrderItem;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    const row = await orderItemsRepository.update(id, values);
    if (!row) throw new NotFoundError();
    return row;
  },
  async remove(id: string): Promise<void> {
    const row = await orderItemsRepository.remove(id);
    if (!row) throw new NotFoundError();
  },
};
