import { describe, it, expect } from "vitest";
import { classifyAndDraftEnquiry } from "../lib/ai-router";

describe("AI Enquiry Router & Grounded Draft Reply Engine", () => {
  it("classifies ENQ-4410 (wedding) and drafts event proposal", async () => {
    const result = await classifyAndDraftEnquiry(
      "Venue for my sister's wedding in Feb 2027, about 250 guests, 2 nights",
      "Vikramaditya Hegde"
    );

    expect(result.category).toBe("WEDDING");
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0.90);
    expect(result.assignedTo).toContain("Events");
    expect(result.extractedPax).toBe(250);
    expect(result.extractedDates).toContain("Feb 2027");
    expect(result.draftReply).toContain("Estate Amphitheatre and Mist Lawns");
    expect(result.draftReply).toContain("300 guests");
  });

  it("classifies ENQ-4411 (room booking) and grounds draft in live database tariff table", async () => {
    const result = await classifyAndDraftEnquiry(
      "Is a villa free 14-16 Nov for 2 adults and a child?",
      "Pooja Sharma"
    );

    expect(result.category).toBe("ROOM_BOOKING");
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0.90);
    expect(result.assignedTo).toContain("Reservations Team");
    expect(result.extractedPax).toBe(3);
    // Verified: Grounded in database rate table for Pool Villa (₹22,000 + 18% GST = ₹25,960)
    expect(result.draftReply).toContain("₹22,000");
    expect(result.draftReply).toContain("18%");
    expect(result.draftReply).toContain("₹25,960");
  });

  it("classifies ENQ-4412 (corporate offsite) with conference hall requirements", async () => {
    const result = await classifyAndDraftEnquiry(
      "Team of 45 wants a January offsite with a conference hall",
      "Arun Iyer"
    );

    expect(result.category).toBe("CORPORATE_OFFSITE");
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0.90);
    expect(result.assignedTo).toContain("Corporate");
    expect(result.extractedPax).toBe(45);
    expect(result.draftReply).toContain("Pepper Grove Conference Pavilion");
    expect(result.draftReply).toContain("Plantation View Cottages");
  });

  it("automatically routes guest complaints to GM triage queue with urgent alert", async () => {
    const result = await classifyAndDraftEnquiry(
      "Hot water geyser was completely broken in Cottage 12 during our stay this morning and the front desk took 2 hours to send someone.",
      "Dr. Sandeep Rao"
    );

    expect(result.category).toBe("COMPLAINT");
    expect(result.status).toBe("ESCALATED_GM");
    expect(result.assignedTo).toContain("General Manager");
    expect(result.draftReply).toContain("Rajeev Menon");
    expect(result.draftReply).toContain("General Manager");
  });

  it("routes ambiguous / low confidence queries (< 80%) to GM Unsorted Lane", async () => {
    const result = await classifyAndDraftEnquiry(
      "Send best price and package.",
      "Inquirer"
    );

    expect(result.confidenceScore).toBeLessThan(0.80);
    expect(result.status).toBe("NEEDS_REVIEW");
    expect(result.assignedTo).toContain("General Manager (Unsorted Lane)");
  });
});
