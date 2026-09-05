import { eq, and, desc, sql, ilike, or } from "drizzle-orm";
import { db } from "../db";
import { orders, orderItems, Order, NewOrder, OrderItem, NewOrderItem, users } from "../db/schema";

export interface ListOrdersFilter {
  userId?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export const ordersRepository = {
  async list(filters: ListOrdersFilter = {}): Promise<{ items: (Order & { items: OrderItem[] })[]; total: number }> {
    const conditions = [];

    if (filters.userId) {
      conditions.push(eq(orders.userId, filters.userId));
    }
    if (filters.status) {
      conditions.push(eq(orders.status, filters.status as any));
    }
    if (filters.search && filters.search.trim()) {
      const q = `%${filters.search.trim()}%`;
      conditions.push(
        or(
          ilike(orders.orderNumber, q),
          ilike(orders.customerName, q),
          ilike(orders.customerEmail, q),
          ilike(orders.customerPhone, q),
          ilike(orders.razorpayOrderId, q)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const limit = filters.limit ?? 50;
    const offset = filters.offset ?? 0;

    const [orderRows, countRes] = await Promise.all([
      db
        .select()
        .from(orders)
        .where(whereClause)
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(orders)
        .where(whereClause),
    ]);

    const total = countRes[0]?.count ?? 0;

    // Fetch items for each order
    if (orderRows.length === 0) {
      return { items: [], total };
    }

    const orderIds = orderRows.map((o) => o.id);
    const itemRows = await db
      .select()
      .from(orderItems)
      .where(sql`${orderItems.orderId} IN ${orderIds}`);

    const itemsMap = new Map<string, OrderItem[]>();
    for (const item of itemRows) {
      const list = itemsMap.get(item.orderId) || [];
      list.push(item);
      itemsMap.set(item.orderId, list);
    }

    const populatedOrders = orderRows.map((o) => ({
      ...o,
      items: itemsMap.get(o.id) || [],
    }));

    return { items: populatedOrders, total };
  },

  async getById(id: string): Promise<(Order & { items: OrderItem[] }) | null> {
    const rows = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!rows[0]) return null;

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
    return { ...rows[0], items };
  },

  async getByOrderNumber(orderNumber: string): Promise<(Order & { items: OrderItem[] }) | null> {
    const rows = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
    if (!rows[0]) return null;

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, rows[0].id));
    return { ...rows[0], items };
  },

  async getByRazorpayOrderId(razorpayOrderId: string): Promise<(Order & { items: OrderItem[] }) | null> {
    const rows = await db.select().from(orders).where(eq(orders.razorpayOrderId, razorpayOrderId)).limit(1);
    if (!rows[0]) return null;

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, rows[0].id));
    return { ...rows[0], items };
  },

  async create(
    orderData: NewOrder,
    itemsData: Array<Omit<NewOrderItem, "id" | "orderId">>
  ): Promise<Order & { items: OrderItem[] }> {
    return db.transaction(async (tx) => {
      const [newOrder] = await tx.insert(orders).values(orderData).returning();
      
      let insertedItems: OrderItem[] = [];
      if (itemsData.length > 0) {
        insertedItems = await tx
          .insert(orderItems)
          .values(
            itemsData.map((item) => ({
              ...item,
              orderId: newOrder.id,
            }))
          )
          .returning();
      }

      return {
        ...newOrder,
        items: insertedItems,
      };
    });
  },

  async update(id: string, data: Partial<Omit<NewOrder, "id">>): Promise<Order | null> {
    const [updated] = await db
      .update(orders)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(orders.id, id))
      .returning();
    return updated ?? null;
  },

  async updateStatus(id: string, status: Order["status"]): Promise<Order | null> {
    const [updated] = await db
      .update(orders)
      .set({ status, updatedAt: new Date().toISOString() })
      .where(eq(orders.id, id))
      .returning();
    return updated ?? null;
  },
};

