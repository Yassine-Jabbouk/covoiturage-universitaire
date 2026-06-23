import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { createNotification } from "@/lib/notifications";

// POST /api/bookings/:id/accept → driver accepts a pending join request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log(`[POST /api/bookings/${id}/accept] request received`);

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
      include: { ride: { include: { bookings: true } }, user: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (booking.ride.userId !== user.id) {
      console.warn(
        `[POST /api/bookings/${id}/accept] user ${user.id} is not the ride owner, blocked`
      );
      return NextResponse.json(
        { error: "Only the driver can accept requests" },
        { status: 403 }
      );
    }

    if (booking.status !== "PENDING") {
      return NextResponse.json(
        { error: "This request has already been handled" },
        { status: 400 }
      );
    }

    const acceptedCount = booking.ride.bookings.filter(
      (b) => b.status === "ACCEPTED"
    ).length;

    if (acceptedCount >= booking.ride.seats) {
      return NextResponse.json(
        { error: "No seats remaining on this ride" },
        { status: 400 }
      );
    }

    await prisma.booking.update({
      where: { id },
      data: { status: "ACCEPTED" },
    });

    console.log(`[POST /api/bookings/${id}/accept] accepted`);

    await createNotification(
      booking.userId,
      `Votre demande pour le trajet ${booking.ride.from} → ${booking.ride.to} a été acceptée !`,
      "join_accepted"
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[POST /api/bookings/${id}/accept] ERROR:`, error);
    return NextResponse.json(
      { error: "Failed to accept request" },
      { status: 500 }
    );
  }
}