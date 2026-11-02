import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Arabica Highlands Resort & Sanctuary database...");

  // 1. Clean existing records in correct relation order
  await prisma.bookingNight.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.dailyAllotment.deleteMany();
  await prisma.roomType.deleteMany();
  await prisma.enquiry.deleteMany();
  await prisma.user.deleteMany();
  await prisma.promoCode.deleteMany();

  // 2. Seed Users
  const gmUser = await prisma.user.create({
    data: {
      email: "gm@arabicahighlands.com",
      name: "Rajeev Menon (General Manager)",
      role: "GM",
    },
  });

  const staffUser = await prisma.user.create({
    data: {
      email: "reservations@arabicahighlands.com",
      name: "Ananya Rao (Reservations Lead)",
      role: "STAFF",
    },
  });

  const guestUser = await prisma.user.create({
    data: {
      email: "guest@example.com",
      name: "Karthik Subramanian",
      role: "GUEST",
    },
  });

  console.log("Seeded Users: GM, Staff, Guest");

  // 3. Seed 76 Keys across 3 Categories (Matching Brief: 64 rooms + 12 villas)
  // - 20 Estate Classic Heritage Rooms @ ₹7,200 (under ₹7,500 threshold -> 12% GST)
  // - 44 Plantation View Cottages @ ₹11,500 (above ₹7,500 threshold -> 18% GST)
  // - 12 Estate Private Pool Villas @ ₹22,000 (above ₹7,500 threshold -> 18% GST)
  const heritageRoom = await prisma.roomType.create({
    data: {
      slug: "estate-heritage-room",
      name: "Estate Heritage Room",
      category: "Rooms",
      totalKeys: 20,
      basePrice: 7200, // Demonstrates 12% GST slab
      maxGuests: 2,
      description:
        "Restored colonial planter architecture with teakwood beams, high ceilings, and an open verandah gazing into 100-year-old shade-grown Robusta plantations.",
      imageUrl: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
      amenities: JSON.stringify([
        "Plantation Verandah",
        "Single-Estate French Press Coffee",
        "King Four-Poster Bed",
        "Artisanal Rain Shower",
        "High-Speed Wi-Fi",
        "Forest Trail Access",
      ]),
    },
  });

  const cottage = await prisma.roomType.create({
    data: {
      slug: "plantation-view-cottage",
      name: "Plantation View Cottage",
      category: "Rooms",
      totalKeys: 44,
      basePrice: 11500, // Demonstrates 18% GST slab
      maxGuests: 3,
      description:
        "Cantilevered timber cottages perched above the mist-covered slopes. Features floor-to-ceiling glass, sunset deck, and an outdoor soaking tub.",
      imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      amenities: JSON.stringify([
        "Panoramic Mist View Deck",
        "Outdoor Soaking Tub",
        "Fireplace & Turndown Service",
        "Aeropress Barista Kit",
        "Complimentary High Tea",
        "Nature Walk Guide Included",
      ]),
    },
  });

  const villa = await prisma.roomType.create({
    data: {
      slug: "estate-private-pool-villa",
      name: "Estate Private Pool Villa",
      category: "Villas",
      totalKeys: 12,
      basePrice: 22000, // Demonstrates 18% GST slab
      maxGuests: 4,
      description:
        "Secluded sanctuary nestled beneath silver oak and wild fig trees. Features a heated private plunge pool, secluded courtyard lawn, and dedicated estate butler.",
      imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
      amenities: JSON.stringify([
        "Temperature-Controlled Plunge Pool",
        "Private Lawn & Sun Loungers",
        "Dedicated Estate Butler",
        "Bean-to-Cup Coffee Tasting",
        "In-Villa Candlelight Dining",
        "Chauffeured Estate Buggy",
      ]),
    },
  });

  console.log("Seeded Room Types: 76 keys total (20 Heritage + 44 Cottage + 12 Villa)");

  // 4. Seed Daily Allotments (Direct Website Quota protecting OTA inventory)
  // Generating 90 days of inventory starting from Nov 1, 2026
  const startDate = new Date("2026-11-01T00:00:00Z");
  const rooms = [
    { type: heritageRoom, directAllotment: 6, price: 7200 },
    { type: cottage, directAllotment: 10, price: 11500 },
    { type: villa, directAllotment: 3, price: 22000 },
  ];

  for (let i = 0; i < 90; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];

    for (const r of rooms) {
      await prisma.dailyAllotment.create({
        data: {
          roomTypeId: r.type.id,
          date: dateStr,
          totalAllotment: r.directAllotment,
          bookedCount: 0,
          basePrice: r.price,
          stopSell: false,
        },
      });
    }
  }

  // Set up dedicated Concurrency Test Target Date: 2027-02-15
  // Heritage room on this date has totalAllotment = 1, bookedCount = 0 (Exactly 1 unit remaining!)
  await prisma.dailyAllotment.upsert({
    where: {
      roomTypeId_date: {
        roomTypeId: heritageRoom.id,
        date: "2027-02-15",
      },
    },
    update: {
      totalAllotment: 1,
      bookedCount: 0,
      basePrice: 7200,
      stopSell: false,
    },
    create: {
      roomTypeId: heritageRoom.id,
      date: "2027-02-15",
      totalAllotment: 1,
      bookedCount: 0,
      basePrice: 7200,
      stopSell: false,
    },
  });

  console.log("Seeded 90 days of Allotments + dedicated 2027-02-15 Concurrency Test target (1 unit)");

  // 5. Pre-seed Sample Enquiries from the Client Brief
  await prisma.enquiry.create({
    data: {
      enquiryNumber: "ENQ-4410",
      channel: "WEB_FORM",
      senderName: "Vikramaditya Hegde",
      senderEmail: "vikram.hegde@example.com",
      senderPhone: "+91 98450 12345",
      rawMessage: "Venue for my sister's wedding in Feb 2027, about 250 guests, 2 nights",
      category: "WEDDING",
      confidenceScore: 0.96,
      status: "REVIEWED",
      assignedTo: "Sales Team (Events)",
      extractedDates: "Feb 2027 (2 nights)",
      extractedPax: 250,
      extractedBudget: 1500000,
      notes: "Requires full lawn booking and banquet accommodation block for 250 pax.",
      draftReply:
        "Dear Vikramaditya,\n\nThank you for considering Arabica Highlands for your sister's wedding celebration in February 2027.\n\nOur Estate Amphitheatre and Mist Lawns comfortably accommodate up to 300 guests, with colonial gazebos and canopy lighting. For a 250-guest celebration over 2 nights, we recommend a complete resort buyout covering our 76 keys (Heritage Rooms, Plantation Cottages, and Pool Villas) to ensure absolute privacy for your families.\n\nOur wedding coordinator would be delighted to host you for a private estate tour and bespoke tasting menu. May we schedule a consultation call this week?\n\nWarm regards,\nSales & Events Team\nArabica Highlands Resort & Sanctuary, Chikkamagaluru",
    },
  });

  await prisma.enquiry.create({
    data: {
      enquiryNumber: "ENQ-4411",
      channel: "WHATSAPP",
      senderName: "Pooja Sharma",
      senderEmail: "pooja.sharma@example.com",
      senderPhone: "+91 98860 98765",
      rawMessage: "Is a villa free 14-16 Nov for 2 adults and a child?",
      category: "ROOM_BOOKING",
      confidenceScore: 0.98,
      status: "PENDING",
      assignedTo: "Reservations Team",
      extractedDates: "14-16 Nov 2026 (2 nights)",
      extractedPax: 3,
      extractedBudget: null,
      notes: "2 adults + 1 child. Requested Estate Private Pool Villa.",
      draftReply:
        "Dear Pooja,\n\nGreetings from Arabica Highlands, Chikkamagaluru.\n\nYes! We currently have our Estate Private Pool Villa available for your dates (14–16 November 2026, 2 nights) for 2 adults and 1 child.\n\nThe direct tariff from our rate table is ₹22,000 per night. Per Indian GST regulations for tariffs above ₹7,500, GST applies at 18% (₹3,960/night), bringing the total to ₹25,960 per night inclusive of breakfast, plantation buggy transfers, and guided estate walks.\n\nWould you like us to place a complimentary 24-hour hold on this villa for your family?\n\nWarm regards,\nReservations Team\nArabica Highlands Resort & Sanctuary",
    },
  });

  await prisma.enquiry.create({
    data: {
      enquiryNumber: "ENQ-4412",
      channel: "EMAIL",
      senderName: "Arun Iyer",
      senderEmail: "arun.iyer@techfirm.io",
      senderPhone: "+91 97410 44556",
      rawMessage: "Team of 45 wants a January offsite with a conference hall",
      category: "CORPORATE_OFFSITE",
      confidenceScore: 0.95,
      status: "PENDING",
      assignedTo: "Sales Team (Corporate)",
      extractedDates: "January 2027 (Dates flexible)",
      extractedPax: 45,
      extractedBudget: 650000,
      notes: "Corporate leadership offsite, AV conference facilities required for 45 pax.",
      draftReply:
        "Dear Arun,\n\nThank you for reaching out regarding your team offsite in January 2027.\n\nOur Pepper Grove Conference Pavilion accommodates up to 60 delegates in theatre or cluster seating, fully equipped with high-speed 100 Mbps uplink, 4K projection, and estate-roasted coffee breaks.\n\nFor 45 delegates, we can arrange twin-occupancy Plantation View Cottages (₹11,500/night + 18% GST) alongside team coffee-cupping challenges, guided forest treks, and barbecue bonfire evenings.\n\nI have attached our Corporate Offsite dossier. Would Thursday at 3 PM work for a brief call to align on dates?\n\nWarm regards,\nCorporate Sales\nArabica Highlands Resort & Sanctuary",
    },
  });

  // Complaint Sample: Demonstrates GM Escalation Requirement
  await prisma.enquiry.create({
    data: {
      enquiryNumber: "ENQ-4413",
      channel: "WHATSAPP",
      senderName: "Dr. Sandeep Rao",
      senderEmail: "dr.sandeep@hospital.org",
      senderPhone: "+91 94480 33221",
      rawMessage: "Hot water geyser was completely broken in Cottage 12 during our stay this morning and the front desk took 2 hours to send someone. Deeply disappointed.",
      category: "COMPLAINT",
      confidenceScore: 0.99,
      status: "ESCALATED_GM",
      assignedTo: "General Manager (Urgent Escalation)",
      extractedDates: "Current Stay",
      extractedPax: 2,
      notes: "Immediate service failure. Escalated to GM mobile and unsorted triage queue.",
      draftReply:
        "Dear Dr. Rao,\n\nI am deeply sorry for the frustrating delay in resolving the hot water geyser in Cottage 12 this morning. This falls well short of our hospitality standards.\n\nI have immediately instructed our Chief Engineer to inspect Cottage 12 and will personally ensure your comfort for the rest of your stay. As a modest gesture of our apology, tonight's plantation candlelight dinner is on us, and I would appreciate the opportunity to meet you in person at your convenience.\n\nSincerely,\nRajeev Menon\nGeneral Manager, Arabica Highlands Resort\nDirect: +91 98450 00100",
    },
  });

  // Ambiguous / Low-Confidence Sample: Demonstrates Low-Confidence GM Lane
  await prisma.enquiry.create({
    data: {
      enquiryNumber: "ENQ-4414",
      channel: "EMAIL",
      senderName: "Inquirer",
      senderEmail: "guest.info@gmail.com",
      senderPhone: null,
      rawMessage: "Hi, send best price and package.",
      category: "OTHER",
      confidenceScore: 0.42, // Low confidence (< 0.80) -> Routes to GM Unsorted Lane
      status: "NEEDS_REVIEW",
      assignedTo: "General Manager (Unsorted Lane)",
      notes: "Low AI confidence (42%). Intent unclear, no dates or pax specified.",
      draftReply:
        "Dear Guest,\n\nThank you for your interest in Arabica Highlands Resort & Sanctuary, Chikkamagaluru.\n\nCould you kindly share your preferred travel dates and the number of guests in your party? We will be delighted to check availability across our Heritage Rooms, Plantation Cottages, and Pool Villas and share our best direct tariffs.\n\nWarm regards,\nReservations Team\nArabica Highlands",
    },
  });

  console.log("Seeded Enquiries: ENQ-4410, ENQ-4411, ENQ-4412, ENQ-4413 (Escalated), ENQ-4414 (Low Confidence)");

  // 6. Pre-seed Promo Codes
  await prisma.promoCode.create({
    data: {
      code: "DIRECT10",
      discountPercent: 10,
      active: true,
      description: "10% off direct website bookings (Beating OTA commission)",
    },
  });

  await prisma.promoCode.create({
    data: {
      code: "ESTATE15",
      discountPercent: 15,
      active: true,
      description: "15% off multi-night plantation getaways",
    },
  });

  console.log("Seeded Promo Codes: DIRECT10, ESTATE15");
  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
