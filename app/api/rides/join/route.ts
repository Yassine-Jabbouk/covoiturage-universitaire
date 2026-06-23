import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { createNotification } from "@/lib/notifications";

// POST /api/rides/join → create a PENDING booking request, notify the driver
export async function POST(request: Request) {
  console.log("[POST /api/rides/join] request received");

  try {
    const user = await getCurrentUser();

    if (!user) {
      console.warn("[POST /api/rides/join] no session, blocked");
      return NextResponse.json(
        { error: "You must be logged in to join a ride" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { rideId } = body;

    if (!rideId) {
      return NextResponse.json({ error: "rideId is required" }, { status: 400 });
    }

    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: { bookings: true },
    });

    if (!ride) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    }

    const existingBooking = ride.bookings.find((b) => b.userId === user.id);
    if (existingBooking) {
      const message =
        existingBooking.status === "PENDING"
          ? "Vous avez déjà une demande en attente pour ce trajet"
          : existingBooking.status === "ACCEPTED"
          ? "Vous avez déjà rejoint ce trajet"
          : "Votre demande pour ce trajet a été refusée";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const acceptedCount = ride.bookings.filter(
      (b) => b.status === "ACCEPTED"
    ).length;
    const availableSeats = ride.seats - acceptedCount;

    if (availableSeats <= 0) {
      return NextResponse.json({ error: "Ride is full" }, { status: 400 });
    }

    const booking = await prisma.booking.create({
      data: {
        rideId,
        userId: user.id,
        status: "PENDING",
      },
    });

    console.log(
      `[POST /api/rides/join] booking request created, id: ${booking.id}`
    );

    // Notify the driver, linking the notification to this booking so
    // Accept/Reject buttons can act on it directly
    await createNotification(
      ride.userId,
      `${user.name} souhaite rejoindre votre trajet ${ride.from} → ${ride.to}.`,
      "join_request",
      booking.id
    );

    const updatedRide = await prisma.ride.findUnique({
      where: { id: rideId },
      include: { bookings: true },
    });

    return NextResponse.json(updatedRide, { status: 201 });
  } catch (error) {
    console.error("[POST /api/rides/join] ERROR:", error);
    return NextResponse.json(
      { error: "Failed to request to join ride" },
      { status: 500 }
    );
  }
}