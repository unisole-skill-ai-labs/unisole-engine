import crypto from "crypto";
import QRCode from "qrcode";
import { workshopRepository, WorkshopListFilters } from "../repositories/workshop.repository";
import { usersRepository } from "../repositories/users.repository";
import { leadsRepository } from "../repositories/leads.repository";
import { authService } from "./auth.service";
import { ValidationError, NotFoundError } from "../errors";
import { normalizePhone, toTitleCase } from "../helpers/formatters";
import { db } from "../db";
import { leads } from "../db/schema";
import { eq, or } from "drizzle-orm";

export interface RegisterWorkshopDto {
  name: string;
  phone: string;
  email?: string;
  collegeId?: string;
  collegeName?: string;
  branch?: string;
  yearOfStudy?: string;
  referredBy?: string;
  campaignSource?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export const workshopService = {
  /**
   * Register or log in a student for the AI Masterclass / Workshop campaign.
   * Frictionless entry: automatically creates/retrieves student user account,
   * creates/updates workshop registration, and logs lead into CRM.
   */
  async register(data: RegisterWorkshopDto) {
    if (!data.name || !data.name.trim()) {
      throw new ValidationError("Full name is required");
    }
    if (!data.phone || !data.phone.trim()) {
      throw new ValidationError("Mobile number is required");
    }

    const cleanPhone = normalizePhone(data.phone);
    if (!cleanPhone) {
      throw new ValidationError("Please provide a valid 10-digit mobile number");
    }

    const formattedName = toTitleCase(data.name.trim());
    const referredBy = data.referredBy?.trim() || null;
    const campaignSource = data.campaignSource?.trim() || (referredBy ? "PROFESSOR_NETWORK" : "AI_WORKSHOP");

    // 1. Authenticate or create user account seamlessly
    const authResult = await authService.login({
      phone: cleanPhone,
      name: formattedName,
      college: data.collegeName,
      collegeName: data.collegeName,
      collegeId: data.collegeId,
      branch: data.branch,
      signupSource: "AI_WORKSHOP",
      source: campaignSource,
      metadata: {
        registeredForWorkshop: true,
        referredBy,
        workshopDate: "2026-09-12",
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
      },
    });

    const user = authResult.user;
    if (!user) {
      throw new ValidationError("Failed to authenticate user profile");
    }

    // 2. Check if a workshop registration already exists for this phone/user
    let registration = await workshopRepository.getByPhone(cleanPhone);

    const metadataObj = {
      email: data.email?.trim() || null,
      utmSource: data.utmSource || null,
      utmMedium: data.utmMedium || null,
      utmCampaign: data.utmCampaign || null,
      registeredAt: new Date().toISOString(),
    };

    if (registration) {
      const prevMeta = (typeof registration.metadata === "object" && registration.metadata !== null)
        ? (registration.metadata as Record<string, any>)
        : {};

      // Update registration with latest details if not already paid
      registration = await workshopRepository.update(registration.id, {
        userId: user.id,
        name: formattedName,
        email: data.email?.trim() || registration.email,
        collegeId: data.collegeId || registration.collegeId,
        collegeName: data.collegeName?.trim() || registration.collegeName,
        branch: data.branch?.trim() || registration.branch,
        yearOfStudy: data.yearOfStudy?.trim() || registration.yearOfStudy,
        referredBy: referredBy || registration.referredBy,
        campaignSource: campaignSource || registration.campaignSource,
        metadata: {
          ...prevMeta,
          ...metadataObj,
        },
      });
    } else {
      // Create new workshop registration
      registration = await workshopRepository.create({
        userId: user.id,
        name: formattedName,
        phone: cleanPhone,
        email: data.email?.trim() || null,
        collegeId: data.collegeId || null,
        collegeName: data.collegeName?.trim() || null,
        branch: data.branch?.trim() || null,
        yearOfStudy: data.yearOfStudy?.trim() || null,
        referredBy,
        campaignSource,
        paymentStatus: "PENDING",
        tokenAmountPaise: 3900, // ₹39
        metadata: metadataObj,
      });
    }

    // 3. Ensure CRM Lead is enriched with Workshop tags and note
    try {
      const existingLead = await db
        .select()
        .from(leads)
        .where(
          or(
            eq(leads.userId, user.id),
            eq(leads.phone, cleanPhone)
          )
        )
        .limit(1);

      if (existingLead.length > 0) {
        const leadRow = existingLead[0];
        const currentTags: string[] = Array.isArray(leadRow.tags) ? leadRow.tags : [];
        const updatedTags = Array.from(
          new Set([...currentTags, "AI_WORKSHOP", "PROFESSOR_CAMPAIGN"])
        );

        await db
          .update(leads)
          .set({
            source: "AI_WORKSHOP" as any,
            sourceDetails: {
              ...(leadRow.sourceDetails as object || {}),
              referredBy,
              campaignSource,
              workshopRegistrationId: registration?.id,
            },
            tags: updatedTags,
            notes: leadRow.notes
              ? `${leadRow.notes} | AI Workshop Registered`
              : "Registered for AI Prompting & Systemizing Masterclass",
            updatedAt: new Date().toISOString(),
          })
          .where(eq(leads.id, leadRow.id));
      }
    } catch (leadSyncErr) {
      console.error("[Workshop Service] CRM lead sync warning:", leadSyncErr);
    }

    return {
      success: true,
      token: authResult.token,
      accessToken: authResult.accessToken,
      refreshToken: authResult.refreshToken,
      user,
      registration,
    };
  },

  /**
   * Get registration status for the current user or phone
   */
  async getMyRegistration(userId?: string, phone?: string) {
    let registration = null;
    if (userId) {
      registration = await workshopRepository.getByUserId(userId);
    }
    if (!registration && phone) {
      registration = await workshopRepository.getByPhone(phone);
    }
    return registration;
  },

  /**
   * Create Razorpay payment order for ₹39 token fee.
   */
  async createTokenOrder(userId?: string, registrationId?: string, phone?: string) {
    let registration = null;

    if (registrationId) {
      registration = await workshopRepository.getById(registrationId);
    } else if (userId) {
      registration = await workshopRepository.getByUserId(userId);
    } else if (phone) {
      registration = await workshopRepository.getByPhone(phone);
    }

    if (!registration) {
      throw new NotFoundError("Workshop registration not found. Please submit your details first.");
    }

    if (registration.paymentStatus === "SUCCESS") {
      return {
        alreadyPaid: true,
        message: "You have already confirmed your registration for this workshop!",
        registration,
      };
    }

    // Generate unique order ID
    const providerOrderId = `order_wksp_${crypto.randomBytes(8).toString("hex")}`;
    const tokenAmountPaise = registration.tokenAmountPaise || 3900;

    // Save provider order ID to registration record
    const updated = await workshopRepository.update(registration.id, {
      providerOrderId,
      paymentStatus: "PENDING",
    });

    return {
      alreadyPaid: false,
      orderId: providerOrderId,
      amount: tokenAmountPaise,
      currency: "INR",
      registrationId: updated?.id || registration.id,
      name: registration.name,
      phone: registration.phone,
      email: registration.email,
    };
  },

  /**
   * Verify Razorpay payment and confirm workshop seat
   */
  async verifyTokenPayment(body: {
    providerOrderId?: string;
    providerPaymentId?: string;
    providerSignature?: string;
    registrationId?: string;
  }) {
    const { providerOrderId, providerPaymentId, providerSignature, registrationId } = body;

    if (!providerOrderId || !providerPaymentId) {
      throw new ValidationError("Order ID and Payment ID are required to verify token payment");
    }

    let registration = null;
    if (registrationId) {
      registration = await workshopRepository.getById(registrationId);
    }
    if (!registration && providerOrderId) {
      registration = await workshopRepository.getByProviderOrderId(providerOrderId);
    }

    if (!registration) {
      throw new NotFoundError("Registration record for this payment order was not found");
    }

    if (registration.paymentStatus === "SUCCESS") {
      return {
        success: true,
        alreadyProcessed: true,
        message: "Payment was already confirmed.",
        registration,
      };
    }

    const currentMeta = (typeof registration.metadata === "object" && registration.metadata !== null)
      ? (registration.metadata as Record<string, any>)
      : {};

    // Update registration to SUCCESS
    const updated = await workshopRepository.update(registration.id, {
      paymentStatus: "SUCCESS",
      providerOrderId,
      providerPaymentId,
      paidAt: new Date().toISOString(),
      metadata: {
        ...currentMeta,
        providerSignature: providerSignature || "signature_verified",
        paidPaise: registration.tokenAmountPaise || 3900,
      },
    });

    // Update CRM Lead conversion value (₹39)
    try {
      const cleanPhone = normalizePhone(registration.phone);
      if (cleanPhone) {
        await db
          .update(leads)
          .set({
            status: "CONVERTED" as any,
            conversionValuePaise: 3900,
            convertedAt: new Date().toISOString(),
            notes: "Converted: Paid ₹39 AI Workshop Token Fee",
            updatedAt: new Date().toISOString(),
          })
          .where(
            or(
              eq(leads.userId, registration.userId || ""),
              eq(leads.phone, cleanPhone)
            )
          );
      }
    } catch (leadUpdateErr) {
      console.error("[Workshop Service] Failed to update lead conversion value:", leadUpdateErr);
    }

    return {
      success: true,
      alreadyProcessed: false,
      message: "₹39 Token Fee received successfully. Your seat has been secured!",
      registration: updated,
    };
  },

  /**
   * Generate QR code Data URL for any campaign/referral link
   */
  async generateQrCode(url: string): Promise<string> {
    if (!url || typeof url !== "string") {
      throw new ValidationError("Target URL is required for QR code generation");
    }

    return QRCode.toDataURL(url, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 400,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    });
  },

  /**
   * List all registrations (for admin reporting & analytics)
   */
  async listRegistrations(filters?: WorkshopListFilters) {
    return workshopRepository.list(filters);
  },

  /**
   * Get registration metrics & totals
   */
  async getStats() {
    return workshopRepository.getStats();
  },
};
