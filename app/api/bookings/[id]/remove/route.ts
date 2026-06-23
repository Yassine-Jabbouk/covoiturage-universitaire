import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { createNotification } from "@/lib/notifications";

// POST /api/bookings/:id/remove → driver removes an already-accepted passenger
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log(`[POST /api/bookings/${id}/remove] request received`);

  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { ride: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.ride.userId !== user.id) {
      return NextResponse.json(
        { error: "Only the driver can remove a passenger" },
        { status: 403 }
      );
    }

    await prisma.booking.delete({ where: { id } });

    console.log(`[POST /api/bookings/${id}/remove] removed`);

    await createNotification(
      booking.userId,
      `Le conducteur vous a retiré du trajet ${booking.ride.from} → ${booking.ride.to}.`,
      "passenger_removed"
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[POST /api/bookings/${id}/remove] ERROR:`, error);
    return NextResponse.json(
      { error: "Failed to remove passenger" },
      { status: 500 }
    );
  }
}