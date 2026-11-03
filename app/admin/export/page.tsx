import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import ExportClient from "@/components/ExportClient";

export const dynamic = "force-dynamic";

export default async function ExportPage() {
  const currentUser = await getCurrentUser();

  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      roomType: true,
      nightsBreakdown: true,
    },
  });

  return <ExportClient initialBookings={bookings as any} currentUser={currentUser} />;
}
