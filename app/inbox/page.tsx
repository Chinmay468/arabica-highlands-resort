import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import InboxClient from "@/components/InboxClient";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const currentUser = await getCurrentUser();
  const enquiries = await prisma.enquiry.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <InboxClient initialEnquiries={enquiries} currentUser={currentUser} />;
}
