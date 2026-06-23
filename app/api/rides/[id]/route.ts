import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { createNotification } from "@/lib/notifications";

// GET /api/rides/:id → fetch one ride by id, including its bookings
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log(`[GET /api/rides/${id}] request received`);

  try {
    const ride = await prisma.ride.findUnique({
  where: { id },
  include: {
    bookings: {
      include: { user: { select: { name: true } } },
    },
  },
});

    if (!ride) {
      console.warn(`[GET /api/rides/${id}] ride not found`);
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    }

    console.log(`[GET /api/rides/${id}] ride found`);
    return NextResponse.json(ride);
  } catch (error) {
    console.error(`[GET /api/rides/${id}] ERROR:`, error);
    return NextResponse.json(
      { error: "Failed to fetch ride" },
      { status: 500 }
    );
  }
}

// PUT /api/rides/:id → update a ride (only the owner can do this)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log(`[PUT /api/rides/${id}] request received`);

  try {
    const user = await getCurrentUser();

    if (!user) {
      console.warn(`[PUT /api/rides/${id}] no session, blocked`);
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const ride = await prisma.ride.findUnique({
      where: { id },
      include: { bookings: true },
    });

    if (!ride) {
      console.warn(`[PUT /api/rides/${id}] ride not found`);
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    }

    if (ride.userId !== user.id) {
      console.warn(
        `[PUT /api/rides/${id}] user ${user.id} is not the owner, blocked`
      );
      return NextResponse.json(
        { error: "You can only edit your own rides" },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log(`[PUT /api/rides/${id}] body received:`, body);

    const { driverName, from, to, price, seats, time } = body;

    if (!driverName || !from || !to || !price || !seats || !time) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newSeats = Number(seats);

    if (newSeats < ride.bookings.length) {
      console.warn(
        `[PUT /api/rides/${id}] cannot reduce seats to ${newSeats}, ${ride.bookings.length} already booked`
      );
      return NextResponse.json(
        {
          error: `Impossible : ${ride.bookings.length} personne(s) ont déjà rejoint ce trajet. Vous ne pouvez pas descendre sous ce nombre de places.`,
        },
        { status: 400 }
      );
    }

    const updatedRide = await prisma.ride.update({
      where: { id },
      data: {
        driverName,
        from,
        to,
        price: Number(price),
        seats: newSeats,
        time: new Date(time),
      },
      include: { bookings: true },
    });

    // Notify every passenger that this ride was edited
    for (const booking of ride.bookings) {
      await createNotification(
        booking.userId,
        `Le trajet ${from} → ${to} que vous avez rejoint a été modifié.`,
        "ride_edited"
      );
    }

    console.log(`[PUT /api/rides/${id}] updated successfully`);
    return NextResponse.json(updatedRide);
  } catch (error) {
    console.error(`[PUT /api/rides/${id}] ERROR:`, error);
    return NextResponse.json(
      { error: "Failed to update ride" },
      { status: 500 }
    );
  }
}

// DELETE /api/rides/:id → delete a ride (only the owner or an admin can do this)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log(`[DELETE /api/rides/${id}] request received`);

  try {
    const user = await getCurrentUser();

    if (!user) {
      console.warn(`[DELETE /api/rides/${id}] no session, blocked`);
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

   const ride = await prisma.ride.findUnique({
  where: { id },
  include: {
    bookings: {
      include: { user: { select: { name: true } } },
    },
  },
});

    if (!ride) {
      console.warn(`[DELETE /api/rides/${id}] ride not found`);
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    }

    const isOwner = ride.userId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      console.warn(
        `[DELETE /api/rides/${id}] user ${user.id} is not owner/admin, blocked`
      );
      return NextResponse.json(
        { error: "You can only delete your own rides" },
        { status: 403 }
      );
    }

    // Notify every passenger BEFORE deleting their bookings
    for (const booking of ride.bookings) {
      await createNotification(
        booking.userId,
        `Le trajet ${ride.from} → ${ride.to} que vous aviez rejoint a été annulé.`,
        "ride_cancelled"
      );
    }

    // Bookings reference this ride, so delete them first to satisfy the foreign key
    await prisma.booking.deleteMany({ where: { rideId: id } });
    await prisma.ride.delete({ where: { id } });

    console.log(`[DELETE /api/rides/${id}] deleted successfully`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[DELETE /api/rides/${id}] ERROR:`, error);
    return NextResponse.json(
      { error: "Failed to delete ride" },
      { status: 500 }
    );
  }
}