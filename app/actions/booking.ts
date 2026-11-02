"use server";

import prisma from "@/lib/prisma";

export interface CreateBookingInput {
  roomTypeId: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  roomsCount?: number;
  adults?: number;
  children?: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  dpdpConsent: boolean;
  isForeignGuest?: boolean;
  paymentId?: string;
  promoCode?: string;
}

export interface NightCalculation {
  date: string;
  baseTariff: number;
  gstRate: number; // 0.12 or 0.18
  gstAmount: number;
  totalNightPrice: number;
}

export interface StayPriceQuote {
  nightsCount: number;
  nightsBreakdown: NightCalculation[];
  baseTariffTotal: number;
  discountAmount: number;
  discountedBaseTariff: number;
  gstTotal: number;
  grandTotal: number;
  appliedPromo?: {
    code: string;
    discountPercent: number;
  };
}

/**
 * Generates an array of date strings between check-in and check-out (excluding check-out day).
 */
export function getStayDates(checkIn: string, checkOut: string): string[] {
  const dates: string[] = [];
  const current = new Date(checkIn + "T00:00:00Z");
  const end = new Date(checkOut + "T00:00:00Z");

  if (current >= end) {
    throw new Error("Check-out date must be after check-in date");
  }

  while (current < end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
}

/**
 * Calculates per-night tariff and per-night Indian GST slab:
 * - If that night's per-room tariff <= ₹7,500: apply 12% GST (6% CGST + 6% SGST).
 * - If that night's per-room tariff > ₹7,500: apply 18% GST (9% CGST + 9% SGST).
 * - Sums base tariffs and night-level GST amounts into the final grandTotal.
 */
export async function calculateStayPrice(
  roomTypeId: string,
  checkInDate: string,
  checkOutDate: string,
  roomsCount = 1,
  promoCode?: string
): Promise<StayPriceQuote> {
  const stayDates = getStayDates(checkInDate, checkOutDate);

  const allotments = await prisma.dailyAllotment.findMany({
    where: {
      roomTypeId,
      date: { in: stayDates },
    },
  });

  const roomType = await prisma.roomType.findUnique({
    where: { id: roomTypeId },
  });

  if (!roomType) {
    throw new Error("Invalid room type requested");
  }

  const allotmentMap = new Map(allotments.map((a) => [a.date, a]));

  let promoDiscountPercent = 0;
  if (promoCode) {
    const promo = await prisma.promoCode.findUnique({
      where: { code: promoCode.trim().toUpperCase(), active: true },
    });
    if (promo) {
      promoDiscountPercent = promo.discountPercent;
    }
  }

  let baseTariffTotal = 0;
  let totalGst = 0;
  const nightsBreakdown: NightCalculation[] = [];

  for (const date of stayDates) {
    const allotment = allotmentMap.get(date);
    // Use scheduled daily rate or fallback to room type base rate
    const dailyRatePerRoom = allotment?.basePrice ?? roomType.basePrice;
    const nightBaseTariff = dailyRatePerRoom * roomsCount;

    // Apply promo discount on base tariff if available
    const discountedNightTariff = promoDiscountPercent > 0
      ? Math.round(nightBaseTariff * (1 - promoDiscountPercent / 100))
      : nightBaseTariff;

    // Per-night GST slab rule based on per-room night tariff:
    // If <= 7500 -> 12%
    // If > 7500  -> 18%
    const effectiveRoomRate = promoDiscountPercent > 0
      ? Math.round(dailyRatePerRoom * (1 - promoDiscountPercent / 100))
      : dailyRatePerRoom;

    const gstRate = effectiveRoomRate <= 7500 ? 0.12 : 0.18;
    const nightGst = Math.round(discountedNightTariff * gstRate);
    const totalNightPrice = discountedNightTariff + nightGst;

    baseTariffTotal += nightBaseTariff;
    totalGst += nightGst;

    nightsBreakdown.push({
      date,
      baseTariff: discountedNightTariff,
      gstRate,
      gstAmount: nightGst,
      totalNightPrice,
    });
  }

  const totalDiscount = promoDiscountPercent > 0
    ? Math.round(baseTariffTotal * (promoDiscountPercent / 100))
    : 0;

  const discountedBaseTotal = baseTariffTotal - totalDiscount;
  const grandTotal = discountedBaseTotal + totalGst;

  return {
    nightsCount: stayDates.length,
    nightsBreakdown,
    baseTariffTotal,
    discountAmount: totalDiscount,
    discountedBaseTariff: discountedBaseTotal,
    gstTotal: totalGst,
    grandTotal,
    appliedPromo: promoDiscountPercent > 0 ? {
      code: promoCode!.toUpperCase(),
      discountPercent: promoDiscountPercent,
    } : undefined,
  };
}

/**
 * Checks if website allotment is open and available for the entire duration.
 */
export async function checkAvailability(
  roomTypeId: string,
  checkInDate: string,
  checkOutDate: string,
  roomsCount = 1
): Promise<{ available: boolean; remainingAllotment: number; message?: string }> {
  const stayDates = getStayDates(checkInDate, checkOutDate);

  const allotments = await prisma.dailyAllotment.findMany({
    where: {
      roomTypeId,
      date: { in: stayDates },
    },
  });

  const allotmentMap = new Map(allotments.map((a) => [a.date, a]));
  let minAvailable = Infinity;

  for (const date of stayDates) {
    const allotment = allotmentMap.get(date);
    if (!allotment) {
      return { available: false, remainingAllotment: 0, message: `Allotment not configured for ${date}` };
    }
    if (allotment.stopSell) {
      return { available: false, remainingAllotment: 0, message: `Date ${date} is marked as blackout / stop-sell` };
    }
    const availableToday = allotment.totalAllotment - allotment.bookedCount;
    if (availableToday < roomsCount) {
      return {
        available: false,
        remainingAllotment: availableToday,
        message: `Only ${availableToday} room(s) available on ${date} (requested ${roomsCount})`,
      };
    }
    if (availableToday < minAvailable) {
      minAvailable = availableToday;
    }
  }

  return {
    available: true,
    remainingAllotment: minAvailable === Infinity ? 0 : minAvailable,
  };
}

/**
 * Atomic Direct-Booking Transaction:
 * - Configured with maxWait: 5000ms and timeout: 10000ms.
 * - Atomically locks each night's allotment.
 * - Guarantees zero overbooking even under high concurrency.
 * - Calculates per-night GST slab and records itemized BookingNight entries.
 */
export async function createBooking(input: CreateBookingInput) {
  const {
    roomTypeId,
    checkInDate,
    checkOutDate,
    roomsCount = 1,
    adults = 2,
    children = 0,
    guestName,
    guestEmail,
    guestPhone,
    dpdpConsent,
    isForeignGuest = false,
    paymentId,
    promoCode,
  } = input;

  // Validation
  if (!guestName || !guestEmail || !guestPhone) {
    throw new Error("Guest name, email, and phone are mandatory.");
  }

  if (!dpdpConsent) {
    throw new Error("DPDP Act 2023 consent is required to process reservation personal data.");
  }

  const stayDates = getStayDates(checkInDate, checkOutDate);

  // Wrap strictly inside prisma.$transaction with maxWait and timeout
  return await prisma.$transaction(
    async (tx) => {
      // 1. Fetch and verify room type
      const roomType = await tx.roomType.findUnique({
        where: { id: roomTypeId },
      });

      if (!roomType) {
        throw new Error("Selected room type does not exist.");
      }

      // 2. Fetch promo code if provided
      let promoDiscountPercent = 0;
      if (promoCode) {
        const promo = await tx.promoCode.findUnique({
          where: { code: promoCode.trim().toUpperCase(), active: true },
        });
        if (promo) {
          promoDiscountPercent = promo.discountPercent;
        }
      }

      // 3. Concurrency-safe allotment verification & atomic decrement for each stay date
      const nightCalculations: {
        date: string;
        baseTariff: number;
        gstRate: number;
        gstAmount: number;
        totalNightPrice: number;
      }[] = [];

      let totalBaseTariff = 0;
      let totalGst = 0;

      for (const date of stayDates) {
        const allotment = await tx.dailyAllotment.findUnique({
          where: {
            roomTypeId_date: {
              roomTypeId,
              date,
            },
          },
        });

        if (!allotment) {
          throw new Error(`INSUFFICIENT_ALLOTMENT: No inventory allocated for ${date}`);
        }

        if (allotment.stopSell) {
          throw new Error(`INSUFFICIENT_ALLOTMENT: Date ${date} is closed for bookings (Stop-Sell active)`);
        }

        const remaining = allotment.totalAllotment - allotment.bookedCount;
        if (remaining < roomsCount) {
          throw new Error(
            `INSUFFICIENT_ALLOTMENT: Only ${remaining} room(s) available on ${date}. Requested ${roomsCount}.`
          );
        }

        // Atomic conditional update: update only if remaining capacity is still sufficient
        const updated = await tx.dailyAllotment.updateMany({
          where: {
            id: allotment.id,
            bookedCount: { lte: allotment.totalAllotment - roomsCount },
            stopSell: false,
          },
          data: {
            bookedCount: {
              increment: roomsCount,
            },
          },
        });

        if (updated.count === 0) {
          throw new Error(`INSUFFICIENT_ALLOTMENT: Concurrent booking conflict for date ${date}`);
        }

        // Per-night Tariff & GST Calculation
        const dailyRatePerRoom = allotment.basePrice;
        const rawNightTariff = dailyRatePerRoom * roomsCount;
        const discountedNightTariff = promoDiscountPercent > 0
          ? Math.round(rawNightTariff * (1 - promoDiscountPercent / 100))
          : rawNightTariff;

        const effectiveRoomRate = promoDiscountPercent > 0
          ? Math.round(dailyRatePerRoom * (1 - promoDiscountPercent / 100))
          : dailyRatePerRoom;

        // GST slab logic:
        // <= 7500 -> 12% GST
        // > 7500  -> 18% GST
        const gstRate = effectiveRoomRate <= 7500 ? 0.12 : 0.18;
        const nightGst = Math.round(discountedNightTariff * gstRate);
        const nightTotalPrice = discountedNightTariff + nightGst;

        totalBaseTariff += discountedNightTariff;
        totalGst += nightGst;

        nightCalculations.push({
          date,
          baseTariff: discountedNightTariff,
          gstRate,
          gstAmount: nightGst,
          totalNightPrice: nightTotalPrice,
        });
      }

      const grandTotal = totalBaseTariff + totalGst;

      // 4. Generate unique human-readable booking reference
      const referenceId = `AH-${dateReference()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // 5. Create Booking record
      const booking = await tx.booking.create({
        data: {
          bookingReference: referenceId,
          roomTypeId,
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim().toLowerCase(),
          guestPhone: guestPhone.trim(),
          checkInDate,
          checkOutDate,
          nights: stayDates.length,
          roomsCount,
          adults,
          children,
          baseTariffTotal: totalBaseTariff,
          gstTotal: totalGst,
          grandTotal,
          paymentStatus: "PAID_TEST_MODE",
          paymentId: paymentId || `MOCK_TXN_${Date.now()}`,
          dpdpConsent: true,
          isForeignGuest: Boolean(isForeignGuest),
          status: "CONFIRMED",
          nightsBreakdown: {
            create: nightCalculations.map((n) => ({
              date: n.date,
              baseTariff: n.baseTariff,
              gstRate: n.gstRate,
              gstAmount: n.gstAmount,
              totalNightPrice: n.totalNightPrice,
            })),
          },
        },
        include: {
          roomType: true,
          nightsBreakdown: true,
        },
      });

      return {
        success: true,
        booking,
      };
    },
    {
      maxWait: 5000,
      timeout: 10000,
    }
  );
}

function dateReference(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  return `${year}${month}`;
}
