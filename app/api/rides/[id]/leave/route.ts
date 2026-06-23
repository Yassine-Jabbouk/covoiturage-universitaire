import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// DELETE /api/rides/:id/leave → remove the current user's own booking from a ride
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log(`[DELETE /api/rides/${id}/leave] request received`);

  try {
    const user = await getCurrentUser();

    if (!user) {
      console.warn(`[DELETE /api/rides/${id}/leave] no session, blocked`);
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const booking = await prisma.booking.findFirst({
      where: { rideId: id, userId: user.id },
    });

    if (!booking) {
      console.warn(
        `[DELETE /api/rides/${id}/leave] no booking found for user ${user.id}`
      );
      return NextResponse.json(
        { error: "You have not joined this ride" },
        { status: 404 }
      );
    }

    await prisma.booking.delete({ where: { id: booking.id } });

    console.log(
      `[DELETE /api/rides/${id}/leave] booking ${booking.id} removed`
    );

    const updatedRide = await prisma.ride.findUnique({
      where: { id },
      include: { bookings: true },
    });

    return NextResponse.json(updatedRide);
  } catch (error) {
    console.error(`[DELETE /api/rides/${id}/leave] ERROR:`, error);
    return NextResponse.json(
      { error: "Failed to leave ride" },
      { status: 500 }
    );
  }
}