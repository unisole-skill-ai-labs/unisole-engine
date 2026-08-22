import { cartsRepository } from "../repositories/carts.repository";
import { Cart, NewCart, carts } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { filterColumns } from "../helpers/filterColumns";
import { generateId } from "../helpers/generateId";

export const cartsManager = {
  async list(): Promise<Cart[]> {
    return cartsRepository.list();
  },
  async getById(id: string): Promise<Cart> {
    const row = await cartsRepository.getById(id);
    if (!row) throw new NotFoundError();
    return row;
  },
  async create(body: Record<string, unknown>): Promise<Cart> {
    const values = filterColumns(body, carts) as NewCart;
    values.id = await generateId(carts, "carts", carts.id);
    return cartsRepository.create(values);
  },
  async update(id: string, body: Record<string, unknown>): Promise<Cart> {
    const values = filterColumns(body, carts) as NewCart;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    const row = await cartsRepository.update(id, values);
    if (!row) throw new NotFoundError();
    return row;
  },
  async remove(id: string): Promise<void> {
    const row = await cartsRepository.remove(id);
    if (!row) throw new NotFoundError();
  },
};
