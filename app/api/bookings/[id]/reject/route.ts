import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { createNotification } from "@/lib/notifications";

// POST /api/bookings/:id/reject → driver rejects a pending join request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log(`[POST /api/bookings/${id}/reject] request received`);

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
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (booking.ride.userId !== user.id) {
      return NextResponse.json(
        { error: "Only the driver can reject requests" },
        { status: 403 }
      );
    }

    if (booking.status !== "PENDING") {
      return NextResponse.json(
        { error: "This request has already been handled" },
        { status: 400 }
      );
    }

    await prisma.booking.update({
      where: { id },
      data: { status: "REJECTED" },
    });

    console.log(`[POST /api/bookings/${id}/reject] rejected`);

    await createNotification(
      booking.userId,
      `Votre demande pour le trajet ${booking.ride.from} → ${booking.ride.to} a été refusée.`,
      "join_rejected"
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[POST /api/bookings/${id}/reject] ERROR:`, error);
    return NextResponse.json(
      { error: "Failed to reject request" },
      { status: 500 }
    );
  }
}