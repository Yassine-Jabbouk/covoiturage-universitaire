import { prisma } from "@/lib/prisma";

export async function createNotification(
  userId: string,
  message: string,
  type: "ride_edited" | "ride_cancelled" | "join_request" | "join_accepted" | "join_rejected" | "passenger_removed",
  bookingId?: string
) {
  console.log(`[createNotification] user ${userId}, type ${type}: ${message}`);

  return prisma.notification.create({
    data: { userId, message, type, bookingId },
  });
}