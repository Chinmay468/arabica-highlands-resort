import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import RoomDetailClient from "@/components/RoomDetailClient";

export const dynamic = "force-dynamic";

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const room = await prisma.roomType.findUnique({
    where: { slug },
  });

  if (!room) {
    notFound();
  }

  const allRooms = await prisma.roomType.findMany({
    orderBy: { basePrice: "asc" },
  });

  const roomData = {
    id: room.id,
    name: room.name,
    slug: room.slug,
    category: room.category,
    basePrice: room.basePrice,
    totalKeys: room.totalKeys,
    maxGuests: room.maxGuests,
    description: room.description,
    imageUrl: room.imageUrl,
    amenities: JSON.parse(room.amenities) as string[],
  };

  const allRoomsData = allRooms.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    basePrice: r.basePrice,
    totalKeys: r.totalKeys,
  }));

  return <RoomDetailClient room={roomData} allRooms={allRoomsData} />;
}
