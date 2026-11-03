"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Update daily allotment count and base rate for a specific date and room
 */
export async function updateDailyAllotment(
  allotmentId: string,
  totalAllotment: number,
  basePrice: number,
  stopSell: boolean
) {
  if (totalAllotment < 0 || basePrice <= 0) {
    throw new Error("Invalid allotment or price specified.");
  }

  const allotment = await prisma.dailyAllotment.update({
    where: { id: allotmentId },
    data: {
      totalAllotment,
      basePrice,
      stopSell,
    },
  });

  revalidatePath("/admin/allotment");
  revalidatePath("/");
  return { success: true, allotment };
}

/**
 * Toggle stop sell (blackout date) for a specific allotment
 */
export async function toggleStopSell(allotmentId: string, stopSell: boolean) {
  const allotment = await prisma.dailyAllotment.update({
    where: { id: allotmentId },
    data: { stopSell },
  });

  revalidatePath("/admin/allotment");
  revalidatePath("/");
  return { success: true, allotment };
}

/**
 * Create a new promo code
 */
export async function createPromoCode(code: string, discountPercent: number, description?: string) {
  if (!code || discountPercent <= 0 || discountPercent > 50) {
    throw new Error("Promo code must have a discount between 1% and 50%.");
  }

  const promo = await prisma.promoCode.create({
    data: {
      code: code.trim().toUpperCase(),
      discountPercent,
      description,
      active: true,
    },
  });

  revalidatePath("/admin/allotment");
  return { success: true, promo };
}
