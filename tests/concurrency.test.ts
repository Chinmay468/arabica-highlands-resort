import { describe, it, expect, beforeAll } from "vitest";
import prisma from "../lib/prisma";
import { createBooking, calculateStayPrice } from "../app/actions/booking";

describe("Booking Engine Concurrency & Allotment Protection", () => {
  let heritageRoomId: string;
  let cottageRoomId: string;
  const testDate = "2027-02-15";
  const testCheckoutDate = "2027-02-16";

  beforeAll(async () => {
    // 1. Fetch Room Types
    const heritage = await prisma.roomType.findUnique({
      where: { slug: "estate-heritage-room" },
    });
    const cottage = await prisma.roomType.findUnique({
      where: { slug: "plantation-view-cottage" },
    });

    if (!heritage || !cottage) {
      throw new Error("Seed data missing. Please run `npm run db:seed` first.");
    }

    heritageRoomId = heritage.id;
    cottageRoomId = cottage.id;

    // 2. Prepare test allotment on testDate: EXACTLY 1 UNIT ALLOTTED, 0 BOOKED
    await prisma.dailyAllotment.upsert({
      where: {
        roomTypeId_date: {
          roomTypeId: heritageRoomId,
          date: testDate,
        },
      },
      update: {
        totalAllotment: 1,
        bookedCount: 0,
        basePrice: 7200,
        stopSell: false,
      },
      create: {
        roomTypeId: heritageRoomId,
        date: testDate,
        totalAllotment: 1,
        bookedCount: 0,
        basePrice: 7200,
        stopSell: false,
      },
    });
  });

  it("handles 20 concurrent booking attempts for the last remaining room with atomic locking", async () => {
    const CONCURRENT_REQUESTS = 20;

    const bookingPromises = Array.from({ length: CONCURRENT_REQUESTS }, (_, idx) => {
      return createBooking({
        roomTypeId: heritageRoomId,
        checkInDate: testDate,
        checkOutDate: testCheckoutDate,
        roomsCount: 1,
        adults: 2,
        children: 0,
        guestName: `Concurrent Guest ${idx + 1}`,
        guestEmail: `guest${idx + 1}@example.com`,
        guestPhone: `+91 99000 000${idx.toString().padStart(2, "0")}`,
        dpdpConsent: true,
        isForeignGuest: false,
        paymentId: `MOCK_TXN_PARALLEL_${idx + 1}`,
      });
    });

    const results = await Promise.allSettled(bookingPromises);

    const successful = results.filter((r) => r.status === "fulfilled");
    const failed = results.filter((r) => r.status === "rejected");

    // Verify exactly ONE booking won the race condition
    expect(successful.length).toBe(1);
    expect(failed.length).toBe(CONCURRENT_REQUESTS - 1);

    // Verify all failures were due to allotment exhaustion
    for (const failure of failed) {
      if (failure.status === "rejected") {
        const errorMsg = (failure.reason as Error)?.message || "";
        expect(errorMsg).toContain("INSUFFICIENT_ALLOTMENT");
      }
    }

    // Verify database state: bookedCount MUST be exactly 1
    const updatedAllotment = await prisma.dailyAllotment.findUnique({
      where: {
        roomTypeId_date: {
          roomTypeId: heritageRoomId,
          date: testDate,
        },
      },
    });

    expect(updatedAllotment).not.toBeNull();
    expect(updatedAllotment?.bookedCount).toBe(1);
    expect(updatedAllotment?.totalAllotment).toBe(1);

    // Verify the winning booking per-night GST calculation (Tariff <= ₹7500 -> 12% GST)
    const winningBooking = (successful[0] as PromiseFulfilledResult<any>).value.booking;
    expect(winningBooking).toBeDefined();
    expect(winningBooking.baseTariffTotal).toBe(7200);
    expect(winningBooking.gstTotal).toBe(864); // 12% of 7200 = 864
    expect(winningBooking.grandTotal).toBe(8064); // 7200 + 864
    expect(winningBooking.nightsBreakdown.length).toBe(1);
    expect(winningBooking.nightsBreakdown[0].gstRate).toBe(0.12);
  });

  it("calculates 18% GST for tariffs above ₹7,500 and itemizes nights", async () => {
    const cottageCheckout = "2027-02-17"; // 2 nights
    const quote = await calculateStayPrice(
      cottageRoomId,
      "2027-02-15",
      cottageCheckout,
      1
    );

    // Cottage is ₹11,500/night (> ₹7,500 threshold -> 18% GST)
    expect(quote.nightsCount).toBe(2);
    expect(quote.nightsBreakdown[0].baseTariff).toBe(11500);
    expect(quote.nightsBreakdown[0].gstRate).toBe(0.18);
    expect(quote.nightsBreakdown[0].gstAmount).toBe(2070); // 18% of 11500
    expect(quote.nightsBreakdown[0].totalNightPrice).toBe(13570);

    // Grand total for 2 nights
    expect(quote.baseTariffTotal).toBe(23000);
    expect(quote.gstTotal).toBe(4140);
    expect(quote.grandTotal).toBe(27140);
  });
});
