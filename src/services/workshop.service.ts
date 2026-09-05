import crypto from "crypto";
import QRCode from "qrcode";
import { eq, or, ilike } from "drizzle-orm";
import { db } from "../db";
import { users, leads, colleges, branches, payments } from "../db/schema";
import { usersRepository } from "../repositories/users.repository";
import { collegesRepository } from "../repositories/colleges.repository";
import { branchesRepository } from "../repositories/branches.repository";
import { paymentsRepository } from "../repositories/payments.repository";
import { enrollmentsRepository } from "../repositories/enrollments.repository";
import { authService } from "./auth.service";
import { ordersService } from "./orders.service";
import { paymentsService } from "./payments.service";
import { ValidationError, NotFoundError } from "../errors";
import { normalizePhone, toTitleCase } from "../helpers/formatters";

export interface RegisterWorkshopDto {
  name: string;
  phone: string;
  email?: string;
  collegeName?: string;
  branch?: string;
  occupation?: string; // Student, Working Professional, Professor / Faculty, Other
  yearOfStudy?: string;
}

export interface WorkshopSurveyDto {
  userId?: string;
  phone?: string;
  primaryGoal?: string;
  aiToolsUsed?: string[];
  priorityTopic?: string;
  additionalNotes?: string;
}

export const workshopService = {
  /**
   * Register or log in a student for the AI Masterclass.
   * Auto-creates user, auto-populates college & branch in database if newly entered,
   * and synchronizes into CRM Leads.
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
    const formattedEmail = data.email?.trim().toLowerCase() || null;
    const formattedCollege = data.collegeName?.trim() || null;
    const formattedBranch = data.branch?.trim() || null;
    const occupation = data.occupation?.trim() || "STUDENT";
    const yearOfStudy = data.yearOfStudy?.trim() || null;

    let resolvedCollegeId: string | null = null;

    // 1. Dynamic College Lookup / Auto-Add to DB so all future users can see it
    if (formattedCollege) {
      try {
        const [existingCollege] = await db
          .select()
          .from(colleges)
          .where(ilike(colleges.name, formattedCollege))
          .limit(1);

        if (existingCollege) {
          resolvedCollegeId = existingCollege.id;
        } else {
          // Auto-insert newly typed college so it appears in future dropdowns
          const slug =
            formattedCollege
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "")
              .slice(0, 40) + `-${Date.now().toString(36)}`;

          const newCol = await collegesRepository.create({
            name: formattedCollege,
            slug,
            isActive: true,
          });
          if (newCol) resolvedCollegeId = newCol.id;
        }
      } catch (colErr) {
        console.warn("[Workshop] Auto-create college notice:", colErr);
      }
    }

    // 2. Dynamic Branch Lookup / Auto-Add to DB
    if (formattedBranch && resolvedCollegeId) {
      try {
        const [existingBranch] = await db
          .select()
          .from(branches)
          .where(ilike(branches.name, formattedBranch))
          .limit(1);

        if (!existingBranch) {
          const code =
            formattedBranch
              .toUpperCase()
              .replace(/[^A-Z0-9]/g, "")
              .slice(0, 10) || "GEN";

          await branchesRepository.create({
            name: formattedBranch,
            code,
            collegeId: resolvedCollegeId,
            isActive: true,
          });
        }
      } catch (branchErr) {
        console.warn("[Workshop] Auto-create branch notice:", branchErr);
      }
    }

    // 3. Authenticate or create user account seamlessly
    const authResult = await authService.login({
      phone: cleanPhone,
      name: formattedName,
      college: formattedCollege || undefined,
      collegeName: formattedCollege || undefined,
      collegeId: resolvedCollegeId || undefined,
      branch: formattedBranch || undefined,
      signupSource: "AI_WORKSHOP",
      source: "AI_WORKSHOP",
      metadata: {
        registeredForWorkshop: true,
        email: formattedEmail,
        occupation,
        yearOfStudy,
        workshopDate: "2026-09-12",
        registeredAt: new Date().toISOString(),
      },
    });

    let user = authResult.user;
    if (!user) {
      throw new ValidationError("Failed to initialize user profile");
    }

    // Update user metadata with email and occupation if existing user
    const existingMeta = (typeof user.metadata === "object" && user.metadata !== null)
      ? (user.metadata as Record<string, any>)
      : {};

    const updatedUser = await usersRepository.update(user.id, {
      name: formattedName,
      collegeName: formattedCollege || user.collegeName,
      collegeId: resolvedCollegeId || user.collegeId,
      branch: formattedBranch || user.branch,
      metadata: {
        ...existingMeta,
        registeredForWorkshop: true,
        email: formattedEmail || existingMeta.email,
        occupation: occupation || existingMeta.occupation,
        yearOfStudy: yearOfStudy || existingMeta.yearOfStudy,
        lastWorkshopLoginAt: new Date().toISOString(),
      },
    });

    if (updatedUser) {
      user = updatedUser;
    }

    // 4. Ensure CRM Lead is enriched with email & Workshop tags
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

      const tags = Array.from(
        new Set([
          ...(existingLead[0]?.tags as string[] || []),
          "AI_WORKSHOP",
          occupation,
        ])
      );

      if (existingLead.length > 0) {
        await db
          .update(leads)
          .set({
            name: formattedName,
            email: formattedEmail || existingLead[0].email,
            collegeName: formattedCollege || existingLead[0].collegeName,
            branch: formattedBranch || existingLead[0].branch,
            yearOfStudy: yearOfStudy || existingLead[0].yearOfStudy,
            source: "AI_WORKSHOP" as any,
            tags,
            notes: existingLead[0].notes
              ? `${existingLead[0].notes} | AI Workshop Registered`
              : "Registered for AI Prompting & Systemizing Masterclass",
            updatedAt: new Date().toISOString(),
          })
          .where(eq(leads.id, existingLead[0].id));
      } else {
        await db.insert(leads).values({
          userId: user.id,
          name: formattedName,
          phone: cleanPhone,
          email: formattedEmail,
          collegeId: resolvedCollegeId,
          collegeName: formattedCollege,
          branch: formattedBranch,
          yearOfStudy,
          quality: "HOT",
          status: "INTERESTED",
          source: "AI_WORKSHOP" as any,
          tags,
          notes: "Registered for AI Prompting & Systemizing Masterclass",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
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
    };
  },

  /**
   * Save post-login workshop survey questions & expectations
   */
  async saveSurvey(body: WorkshopSurveyDto) {
    const { userId, phone, primaryGoal, aiToolsUsed, priorityTopic, additionalNotes } = body;

    let targetUser = null;
    if (userId) {
      targetUser = await usersRepository.getById(userId);
    }
    if (!targetUser && phone) {
      const cleanPhone = normalizePhone(phone);
      if (cleanPhone) {
        targetUser = await usersRepository.getByPhone(cleanPhone);
      }
    }

    if (!targetUser) {
      throw new NotFoundError("User not found for saving survey");
    }

    const currentMeta = (typeof targetUser.metadata === "object" && targetUser.metadata !== null)
      ? (targetUser.metadata as Record<string, any>)
      : {};

    const surveyData = {
      primaryGoal: primaryGoal || "Productivity & AI Workflow Systems",
      aiToolsUsed: Array.isArray(aiToolsUsed) ? aiToolsUsed : [],
      priorityTopic: priorityTopic || null,
      additionalNotes: additionalNotes || null,
      submittedAt: new Date().toISOString(),
    };

    // Update user metadata
    await usersRepository.update(targetUser.id, {
      metadata: {
        ...currentMeta,
        workshopSurvey: surveyData,
      },
    });

    // Update CRM Lead source details
    try {
      const cleanPhone = normalizePhone(targetUser.phone);
      if (cleanPhone) {
        const [leadRow] = await db
          .select()
          .from(leads)
          .where(
            or(
              eq(leads.userId, targetUser.id),
              eq(leads.phone, cleanPhone)
            )
          )
          .limit(1);

        if (leadRow) {
          await db
            .update(leads)
            .set({
              sourceDetails: {
                ...(leadRow.sourceDetails as object || {}),
                workshopSurvey: surveyData,
              },
              updatedAt: new Date().toISOString(),
            })
            .where(eq(leads.id, leadRow.id));
        }
      }
    } catch (err) {
      console.error("[Workshop Service] Lead survey update warning:", err);
    }

    return {
      success: true,
      message: "Survey expectations recorded successfully",
      survey: surveyData,
    };
  },

  /**
   * Get registration status for the user
   */
  async getMyStatus(userId?: string, phone?: string) {
    let targetUser = null;
    if (userId) {
      targetUser = await usersRepository.getById(userId);
    }
    if (!targetUser && phone) {
      const cleanPhone = normalizePhone(phone);
      if (cleanPhone) {
        targetUser = await usersRepository.getByPhone(cleanPhone);
      }
    }

    if (!targetUser) return null;

    const meta = (typeof targetUser.metadata === "object" && targetUser.metadata !== null)
      ? (targetUser.metadata as Record<string, any>)
      : {};

    return {
      userId: targetUser.id,
      name: targetUser.name,
      phone: targetUser.phone,
      collegeName: targetUser.collegeName,
      branch: targetUser.branch,
      email: meta.email || null,
      occupation: meta.occupation || "STUDENT",
      yearOfStudy: meta.yearOfStudy || null,
      isRegistered: !!meta.registeredForWorkshop,
      isTokenPaid: !!meta.tokenPaid,
      survey: meta.workshopSurvey || null,
    };
  },

  /**
   * Create centralized payment order for workshop seat with dynamic catalog pricing.
   */
  async createTokenOrder(userId?: string, phone?: string, couponCode?: string) {
    let targetUser = null;
    if (userId) {
      targetUser = await usersRepository.getById(userId);
    }
    if (!targetUser && phone) {
      const cleanPhone = normalizePhone(phone);
      if (cleanPhone) {
        targetUser = await usersRepository.getByPhone(cleanPhone);
      }
    }

    if (!targetUser) {
      throw new NotFoundError("User not found. Please complete registration first.");
    }

    const meta = (typeof targetUser.metadata === "object" && targetUser.metadata !== null)
      ? (targetUser.metadata as Record<string, any>)
      : {};

    // Check active enrollment in workshop
    const existingEnrollment = await enrollmentsRepository.getActiveByUserAndItem(
      targetUser.id,
      "WORKSHOP",
      "AI_MASTERCLASS_2026"
    );

    if (existingEnrollment || meta.tokenPaid) {
      return {
        alreadyPaid: true,
        message: "You have already confirmed your registration for this masterclass!",
        user: targetUser,
      };
    }

    // Delegate to centralized orders service
    const { order, checkout } = await ordersService.createCheckoutOrder({
      userId: targetUser.id,
      customerName: targetUser.name || "Student",
      customerEmail: meta.email || undefined,
      customerPhone: targetUser.phone || undefined,
      couponCode,
      items: [
        {
          itemType: "WORKSHOP",
          itemId: "AI_MASTERCLASS_2026",
          quantity: 1,
        },
      ],
      notes: "AI Masterclass Registration Token",
    });

    return {
      alreadyPaid: false,
      orderId: checkout.razorpayOrderId,
      orderNumber: checkout.orderNumber,
      amount: checkout.amountPaise,
      currency: checkout.currency,
      name: checkout.customerName,
      phone: checkout.customerPhone,
      email: checkout.customerEmail,
    };
  },

  /**
   * Verify Razorpay payment and confirm workshop seat via centralized paymentsService
   */
  async verifyTokenPayment(body: {
    providerOrderId?: string;
    providerPaymentId?: string;
    providerSignature?: string;
    userId?: string;
    phone?: string;
  }) {
    const { providerOrderId, providerPaymentId, providerSignature, userId, phone } = body;

    if (!providerOrderId || !providerPaymentId) {
      throw new ValidationError("Order ID and Payment ID are required to verify token payment");
    }

    let targetUser = null;
    if (userId) {
      targetUser = await usersRepository.getById(userId);
    }
    if (!targetUser && phone) {
      const cleanPhone = normalizePhone(phone);
      if (cleanPhone) {
        targetUser = await usersRepository.getByPhone(cleanPhone);
      }
    }

    // Call centralized payments service
    const result = await paymentsService.verifyPayment({
      providerOrderId,
      providerPaymentId,
      providerSignature: providerSignature || "verified",
      userId: targetUser?.id,
    });

    return {
      success: true,
      message: "Payment received successfully. Your masterclass seat is secured!",
      tokenPaid: true,
      order: result.order,
      enrolledItems: result.enrolledItems,
    };
  },

  /**
   * Generate QR code Data URL for the universal workshop link
   */
  async generateQrCode(url: string): Promise<string> {
    const targetUrl = url && typeof url === "string" ? url : "https://unisole.org/workshop";
    return QRCode.toDataURL(targetUrl, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 400,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    });
  },
};
