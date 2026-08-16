import { couponsRepository } from "../repositories/coupons.repository";
import { Coupon, NewCoupon, coupons } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { filterColumns } from "../helpers/filterColumns";

export const couponsManager = {
  async list(): Promise<Coupon[]> {
    return couponsRepository.list();
  },
  async getById(id: string): Promise<Coupon> {
    const row = await couponsRepository.getById(id);
    if (!row) throw new NotFoundError();
    return row;
  },
  async create(body: Record<string, unknown>): Promise<Coupon> {
    const values = filterColumns(body, coupons) as NewCoupon;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    return couponsRepository.create(values);
  },
  async update(id: string, body: Record<string, unknown>): Promise<Coupon> {
    const values = filterColumns(body, coupons) as NewCoupon;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    const row = await couponsRepository.update(id, values);
    if (!row) throw new NotFoundError();
    return row;
  },
  async remove(id: string): Promise<void> {
    const row = await couponsRepository.remove(id);
    if (!row) throw new NotFoundError();
  },
};
