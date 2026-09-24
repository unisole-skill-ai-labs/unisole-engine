import { pricingRepository } from "../repositories/pricing.repository";
import { couponsRepository } from "../repositories/coupons.repository";
import { pathwaysRepository } from "../repositories/pathways.repository";
import { coursesRepository } from "../repositories/courses.repository";
import { OfferingPricing, Coupon, ItemType, DiscountType, NewOfferingPricing, NewCoupon } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { CANONICAL_SEO_OFFERINGS, CanonicalOffering } from "../constants/offerings";

export interface ResolvedPrice {
  itemType: ItemType;
  itemId: string;
  title: string;
  pricePaise: number;
  mrpPaise: number;
  currency: string;
}

export interface CouponEvaluation {
  valid: boolean;
  coupon?: Coupon;
  discountAmountPaise: number;
  message?: string;
}

export const pricingService = {
  /**
   * Resolve live pricing for a specific item.
   * Checks dynamic offerings_pricing first, then falls back to catalog tables (courses / pathways) or canonical catalog.
   */
  async resolveItemPrice(itemType: ItemType, itemId: string): Promise<ResolvedPrice> {
    // 0. Alias handling
    if (itemId.toLowerCase() === "mgmt-common") {
      return this.resolveItemPrice(itemType, "cs-common");
    }

    // 1. Check dynamic offerings pricing table
    const dynamicPrice = await pricingRepository.getByItem(itemType, itemId);
    if (dynamicPrice && dynamicPrice.isActive) {
      return {
        itemType: dynamicPrice.itemType,
        itemId: dynamicPrice.itemId,
        title: dynamicPrice.title,
        pricePaise: dynamicPrice.pricePaise,
        mrpPaise: dynamicPrice.mrpPaise,
        currency: dynamicPrice.currency || "INR",
      };
    }

    // 2. Check courses table directly
    if (itemType === "COURSE" || itemType === "WORKSHOP" || itemType === "PROGRAM") {
      const course = await coursesRepository.getBySlugOrId(itemId);
      if (course && course.isActive && course.pricePaise > 0) {
        return {
          itemType: (itemType as ItemType),
          itemId: course.id,
          title: course.title,
          pricePaise: course.pricePaise,
          mrpPaise: course.mrpPaise || course.pricePaise * 3 || 99900,
          currency: "INR",
        };
      }
    }

    // 3. Fallbacks based on itemType
    if (itemType === "PATHWAY") {
      const pathway = await pathwaysRepository.getById(itemId);
      if (pathway && pathway.isActive && pathway.pricePaise > 0) {
        return {
          itemType: "PATHWAY",
          itemId: pathway.id,
          title: pathway.title,
          pricePaise: pathway.pricePaise,
          mrpPaise: pathway.pricePaise * 3 || 99900,
          currency: "INR",
        };
      }
    }

    // 4. Canonical SEO Offerings Fallback
    const canonical = CANONICAL_SEO_OFFERINGS.find(
      (o) =>
        (o.itemId.toLowerCase() === itemId.toLowerCase() || o.slug.toLowerCase() === itemId.toLowerCase()) &&
        (o.itemType === itemType || itemType === "COURSE" || itemType === "PATHWAY" || itemType === "WORKSHOP")
    );

    if (canonical) {
      return {
        itemType: (canonical.itemType as ItemType),
        itemId: canonical.itemId,
        title: canonical.title,
        pricePaise: canonical.pricePaise,
        mrpPaise: canonical.mrpPaise,
        currency: canonical.currency || "INR",
      };
    }

    if (itemType === "WORKSHOP" && (itemId === "AI_MASTERCLASS_2026" || itemId === "DEFAULT" || itemId === "ai-masterclass")) {
      return {
        itemType: "WORKSHOP",
        itemId: "AI_MASTERCLASS_2026",
        title: "AI Revolution & Agentic Engineering Masterclass",
        pricePaise: 3900,
        mrpPaise: 99900,
        currency: "INR",
      };
    }

    throw new NotFoundError(`Pricing not found or inactive for ${itemType} item: ${itemId}`);
  },

  /**
   * Sync all Canonical SEO Offerings to offerings_pricing table.
   * If an offering doesn't exist, insert it. If it exists, preserve admin custom price/mrp.
   */
  async syncCanonicalOfferings(): Promise<{ total: number; inserted: number; updated: number }> {
    let inserted = 0;
    let updated = 0;

    // Clean up deprecated / duplicate offerings
    await pricingRepository.removeByItem("PATHWAY" as ItemType, "mgmt-common").catch(() => {});
    await pricingRepository.removeByItem("PATHWAY" as ItemType, "mgmt-p2").catch(() => {});
    await pricingRepository.removeByItem("PATHWAY" as ItemType, "mgmt-p3").catch(() => {});
    await pricingRepository.removeByItem("PATHWAY" as ItemType, "cs-p2").catch(() => {});
    await pricingRepository.removeByItem("PATHWAY" as ItemType, "cs-p3").catch(() => {});
    await pricingRepository.removeByItem("COURSE" as ItemType, "cs-p2").catch(() => {});
    await pricingRepository.removeByItem("COURSE" as ItemType, "cs-p3").catch(() => {});

    for (const offering of CANONICAL_SEO_OFFERINGS) {
      const existing = await pricingRepository.getByItem(offering.itemType as ItemType, offering.itemId);
      if (!existing) {
        await pricingRepository.upsert({
          itemType: offering.itemType as ItemType,
          itemId: offering.itemId,
          title: offering.title,
          description: offering.description,
          slug: offering.slug,
          pricePaise: offering.pricePaise,
          mrpPaise: offering.mrpPaise,
          currency: offering.currency || "INR",
          isFree: offering.isFree ?? false,
          isActive: offering.isActive ?? true,
          isPublic: offering.isPublic ?? true,
          metadata: offering.metadata || {},
        });
        inserted++;
      } else {
        // Sync metadata, title and slug without overwriting admin's custom pricePaise
        await pricingRepository.update(existing.id, {
          title: offering.title,
          slug: offering.slug,
          metadata: {
            ...(existing.metadata as Record<string, any> || {}),
            ...(offering.metadata || {}),
          },
        });
        updated++;
      }
    }

    return { total: CANONICAL_SEO_OFFERINGS.length, inserted, updated };
  },

  /**
   * Validate and calculate discount for a coupon against a list of items and total amount.
   */
  async evaluateCoupon(
    code: string,
    items: Array<{ itemType: ItemType; itemId: string; pricePaise: number }>,
    totalAmountPaise: number
  ): Promise<CouponEvaluation> {
    if (!code || !code.trim()) {
      return { valid: false, discountAmountPaise: 0, message: "No coupon provided" };
    }

    const coupon = await couponsRepository.getByCode(code);
    if (!coupon) {
      return { valid: false, discountAmountPaise: 0, message: "Invalid coupon code" };
    }

    if (!coupon.isActive) {
      return { valid: false, discountAmountPaise: 0, message: "This coupon is no longer active" };
    }

    const now = new Date();
    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      return { valid: false, discountAmountPaise: 0, message: "This coupon is not yet valid" };
    }
    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      return { valid: false, discountAmountPaise: 0, message: "This coupon has expired" };
    }

    if (coupon.maxUses !== null && coupon.maxUses !== undefined && coupon.usedCount >= coupon.maxUses) {
      return { valid: false, discountAmountPaise: 0, message: "Coupon usage limit reached" };
    }

    if (totalAmountPaise < coupon.minOrderPaise) {
      return {
        valid: false,
        discountAmountPaise: 0,
        message: `Minimum order amount for this coupon is ₹${(coupon.minOrderPaise / 100).toFixed(2)}`,
      };
    }

    // Check item restrictions (Type and specific Course/Item IDs)
    const applicableTypes = Array.isArray(coupon.applicableItemTypes) ? (coupon.applicableItemTypes as string[]) : [];
    const applicableIds = Array.isArray((coupon as any).applicableItemIds) ? ((coupon as any).applicableItemIds as string[]) : [];

    const itemTypesMatch = (couponType: string, itemType: string) => {
      const c = (couponType || "").toLowerCase();
      const i = (itemType || "").toLowerCase();
      if (c === i) return true;
      if ((c === "course" || c === "pathway") && (i === "course" || i === "pathway")) return true;
      return false;
    };

    let eligibleAmountPaise = 0;
    for (const item of items) {
      const typeMatch = applicableTypes.length === 0 || applicableTypes.some((t) => itemTypesMatch(t, item.itemType));
      const idMatch = applicableIds.length === 0 || (item.itemId && applicableIds.includes(item.itemId));
      if (typeMatch && idMatch) {
        eligibleAmountPaise += item.pricePaise;
      }
    }

    if (eligibleAmountPaise <= 0) {
      return {
        valid: false,
        discountAmountPaise: 0,
        message: applicableIds.length > 0
          ? "This coupon is not valid for the selected course"
          : "This coupon is not applicable to the items in your cart",
      };
    }

    // Calculate discount amount
    let discountPaise = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountPaise = Math.round((eligibleAmountPaise * coupon.discountValue) / 100);
      if (coupon.maxDiscountPaise && discountPaise > coupon.maxDiscountPaise) {
        discountPaise = coupon.maxDiscountPaise;
      }
    } else if (coupon.discountType === "FLAT") {
      discountPaise = coupon.discountValue; // Value is in paise for FLAT
      if (discountPaise > eligibleAmountPaise) {
        discountPaise = eligibleAmountPaise;
      }
    }

    return {
      valid: true,
      coupon,
      discountAmountPaise: Math.min(discountPaise, totalAmountPaise),
    };
  },

  // -------------------------------------------------------------
  // Public Catalog & Admin Management Methods
  // -------------------------------------------------------------

  async listPublicPricing(): Promise<OfferingPricing[]> {
    return pricingRepository.listAll({ isPublicOnly: true });
  },

  async listAllPricing(): Promise<OfferingPricing[]> {
    return pricingRepository.listAll();
  },

  async getPricingById(id: string): Promise<OfferingPricing> {
    const row = await pricingRepository.getById(id);
    if (!row) throw new NotFoundError("Pricing item not found");
    return row;
  },

  async upsertPricing(data: NewOfferingPricing): Promise<OfferingPricing> {
    if (!data.title || !data.itemType || !data.itemId) {
      throw new ValidationError("title, itemType, and itemId are required");
    }
    if (data.pricePaise === undefined || data.pricePaise < 0) {
      throw new ValidationError("pricePaise must be a non-negative number");
    }
    return pricingRepository.upsert(data);
  },

  async updatePricing(id: string, data: Partial<Omit<NewOfferingPricing, "id">>): Promise<OfferingPricing> {
    const row = await pricingRepository.update(id, data);
    if (!row) throw new NotFoundError("Pricing item not found");
    return row;
  },

  async deletePricing(id: string): Promise<OfferingPricing> {
    const row = await pricingRepository.remove(id);
    if (!row) throw new NotFoundError("Pricing item not found");
    return row;
  },

  // Coupons Admin Management
  async listCoupons(): Promise<Coupon[]> {
    return couponsRepository.listAll();
  },

  async getCouponById(id: string): Promise<Coupon> {
    const row = await couponsRepository.getById(id);
    if (!row) throw new NotFoundError("Coupon not found");
    return row;
  },

  async createCoupon(data: NewCoupon): Promise<Coupon> {
    if (!data.code || !data.discountType || data.discountValue === undefined) {
      throw new ValidationError("code, discountType, and discountValue are required");
    }
    const existing = await couponsRepository.getByCode(data.code);
    if (existing) {
      throw new ValidationError(`Coupon code ${data.code.toUpperCase()} already exists`);
    }
    return couponsRepository.create(data);
  },

  async updateCoupon(id: string, data: Partial<Omit<NewCoupon, "id">>): Promise<Coupon> {
    const row = await couponsRepository.update(id, data);
    if (!row) throw new NotFoundError("Coupon not found");
    return row;
  },

  async deleteCoupon(id: string): Promise<Coupon> {
    const row = await couponsRepository.remove(id);
    if (!row) throw new NotFoundError("Coupon not found");
    return row;
  },
};
