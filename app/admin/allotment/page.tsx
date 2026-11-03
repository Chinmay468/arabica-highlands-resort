import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import AllotmentAdminClient from "@/components/AllotmentAdminClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AllotmentAdminPage() {
  const currentUser = await getCurrentUser();

  const allotments = await prisma.dailyAllotment.findMany({
    take: 60,
    orderBy: [{ date: "asc" }, { roomTypeId: "asc" }],
    include: {
      roomType: true,
    },
  });

  const promoCodes = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  const roomTypes = await prisma.roomType.findMany();

  return (
    <AllotmentAdminClient
      initialAllotments={allotments as any}
      initialPromoCodes={promoCodes}
      roomTypes={roomTypes}
      currentUser={currentUser}
    />
  );
}
