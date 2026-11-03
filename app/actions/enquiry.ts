"use server";

import prisma from "@/lib/prisma";
import { classifyAndDraftEnquiry } from "@/lib/ai-router";
import { revalidatePath } from "next/cache";

export interface SubmitEnquiryInput {
  channel?: "WEB_FORM" | "EMAIL" | "WHATSAPP";
  senderName: string;
  senderEmail?: string;
  senderPhone?: string;
  message: string;
}

/**
 * Submits an enquiry through any channel (Web form, forwarded email, or simulated WhatsApp),
 * processes it through the AI router, and stores it in the unified inbox.
 */
export async function submitEnquiry(input: SubmitEnquiryInput) {
  const { channel = "WEB_FORM", senderName, senderEmail, senderPhone, message } = input;

  if (!message || message.trim().length === 0) {
    throw new Error("Enquiry message cannot be empty.");
  }

  // 1. Run AI Router
  const aiResult = await classifyAndDraftEnquiry(message, senderName || "Guest");

  // 2. Generate unique enquiry number (e.g. ENQ-4450)
  const count = await prisma.enquiry.count();
  const enquiryNumber = `ENQ-${4415 + count}`;

  // 3. Create record in database
  const enquiry = await prisma.enquiry.create({
    data: {
      enquiryNumber,
      channel,
      senderName: senderName.trim() || "Website Visitor",
      senderEmail: senderEmail?.trim().toLowerCase() || null,
      senderPhone: senderPhone?.trim() || null,
      rawMessage: message.trim(),
      category: aiResult.category,
      confidenceScore: aiResult.confidenceScore,
      status: aiResult.status,
      assignedTo: aiResult.assignedTo,
      extractedDates: aiResult.extractedDates,
      extractedPax: aiResult.extractedPax,
      extractedBudget: aiResult.extractedBudget,
      notes: aiResult.notes,
      draftReply: aiResult.draftReply,
      isSent: false,
    },
  });

  revalidatePath("/inbox");
  revalidatePath("/admin/triage");

  return {
    success: true,
    enquiry,
  };
}

/**
 * 1-Click Re-route enquiry owner or category
 */
export async function rerouteEnquiry(
  enquiryId: string,
  newAssignedTo: string,
  newCategory?: string
) {
  const enquiry = await prisma.enquiry.update({
    where: { id: enquiryId },
    data: {
      assignedTo: newAssignedTo,
      ...(newCategory ? { category: newCategory } : {}),
      status: newAssignedTo.includes("GM") ? "ESCALATED_GM" : "REVIEWED",
    },
  });

  revalidatePath("/inbox");
  return { success: true, enquiry };
}

/**
 * Update draft reply text before approval
 */
export async function updateDraftReply(enquiryId: string, updatedDraft: string) {
  const enquiry = await prisma.enquiry.update({
    where: { id: enquiryId },
    data: { draftReply: updatedDraft },
  });

  revalidatePath("/inbox");
  return { success: true, enquiry };
}

/**
 * 1-Click Human Approval and Dispatch.
 * Drafts are NEVER sent automatically per brief requirement.
 */
export async function approveAndSendReply(enquiryId: string) {
  const enquiry = await prisma.enquiry.update({
    where: { id: enquiryId },
    data: {
      isSent: true,
      sentAt: new Date(),
      status: "REPLIED",
    },
  });

  revalidatePath("/inbox");
  return { success: true, enquiry };
}

/**
 * Fetch enquiries with filtering
 */
export async function getEnquiries(filter: "ALL" | "PENDING" | "ESCALATED_GM" | "NEEDS_REVIEW" | "REPLIED" = "ALL") {
  const whereClause = filter === "ALL" ? {} : { status: filter };

  return await prisma.enquiry.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });
}
