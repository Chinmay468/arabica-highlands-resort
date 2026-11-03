import prisma from "@/lib/prisma";
import HomeClient from "@/components/HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const roomTypes = await prisma.roomType.findMany({
    orderBy: { basePrice: "asc" },
  });

  const roomsData = roomTypes.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    category: r.category,
    basePrice: r.basePrice,
    totalKeys: r.totalKeys,
    maxGuests: r.maxGuests,
    description: r.description,
    imageUrl: r.imageUrl,
    amenities: JSON.parse(r.amenities) as string[],
  }));

  return <HomeClient rooms={roomsData} />;
}
