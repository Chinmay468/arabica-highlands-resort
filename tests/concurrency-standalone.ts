import prisma from "../lib/prisma.js";
import { createBooking } from "../app/actions/booking.js";

async function runStandaloneConcurrencyTest() {
  console.log("================================================================================");
  console.log("🏨 ARABICA HIGHLANDS - ATOMIC ALLOTMENT CONCURRENCY STRESS TEST (20 REQUESTS)");
  console.log("================================================================================");

  // 1. Fetch Room Type
  const heritage = await prisma.roomType.findUnique({
    where: { slug: "estate-heritage-room" },
  });

  if (!heritage) {
    console.error("❌ Room type not found. Please run `npm run db:seed` first.");
    process.exit(1);
  }

  const testDate = "2027-02-15";
  const testCheckout = "2027-02-16";

  // 2. Reset target date to exactly 1 unit available
  await prisma.dailyAllotment.upsert({
    where: {
      roomTypeId_date: {
        roomTypeId: heritage.id,
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
      roomTypeId: heritage.id,
      date: testDate,
      totalAllotment: 1,
      bookedCount: 0,
      basePrice: 7200,
      stopSell: false,
    },
  });

  console.log(`Target Date: ${testDate}`);
  console.log(`Total Website Allotment: 1 unit`);
  console.log(`Current Booked Count: 0 units`);
  console.log(`⚡ Firing 20 concurrent booking requests simultaneously via Promise.allSettled()...\n`);

  const startTime = Date.now();

  const promises = Array.from({ length: 20 }, (_, idx) =>
    createBooking({
      roomTypeId: heritage.id,
      checkInDate: testDate,
      checkOutDate: testCheckout,
      roomsCount: 1,
      guestName: `Concurrent Guest ${idx + 1}`,
      guestEmail: `guest${idx + 1}@example.com`,
      guestPhone: `+91 99000 000${idx.toString().padStart(2, "0")}`,
      dpdpConsent: true,
      isForeignGuest: false,
      paymentId: `MOCK_TXN_PARALLEL_${idx + 1}`,
    })
  );

  const results = await Promise.allSettled(promises);
  const elapsed = Date.now() - startTime;

  const successful = results.filter((r) => r.status === "fulfilled");
  const failed = results.filter((r) => r.status === "rejected");

  console.log(`Test Execution Finished in ${elapsed}ms:`);
  console.log(`  ✅ Fulfilled / Confirmed Bookings: ${successful.length} (Expected: 1)`);
  console.log(`  🛑 Rejected Bookings (Safeguarded): ${failed.length} (Expected: 19)`);

  const finalAllotment = await prisma.dailyAllotment.findUnique({
    where: {
      roomTypeId_date: {
        roomTypeId: heritage.id,
        date: testDate,
      },
    },
  });

  console.log(`  📊 Final Database State: bookedCount = ${finalAllotment?.bookedCount} / totalAllotment = ${finalAllotment?.totalAllotment}`);

  if (successful.length === 1 && failed.length === 19 && finalAllotment?.bookedCount === 1) {
    const winningBooking = (successful[0] as PromiseFulfilledResult<any>).value.booking;
    console.log(`\n🎉 SUCCESS: Atomic locking verified! Zero overbooking under race conditions.`);
    console.log(`   Winning Reference: ${winningBooking.bookingReference}`);
    console.log(`   Base Tariff: ₹${winningBooking.baseTariffTotal}`);
    console.log(`   Per-Night GST (12% slab for ₹7,200): ₹${winningBooking.gstTotal}`);
    console.log(`   Grand Total: ₹${winningBooking.grandTotal}`);
    process.exit(0);
  } else {
    console.error(`\n❌ TEST FAILED: Overbooking or race condition detected.`);
    process.exit(1);
  }
}

runStandaloneConcurrencyTest().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
