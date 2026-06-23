import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// GET /api/my-rides → rides I created + rides I joined
export async function GET() {
  console.log("[GET /api/my-rides] request received");

  try {
    const user = await getCurrentUser();

    if (!user) {
      console.warn("[GET /api/my-rides] no session, blocked");
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const createdRides = await prisma.ride.findMany({
      where: { userId: user.id },
      orderBy: { time: "asc" },
      include: { bookings: true },
    });

    const myBookings = await prisma.booking.findMany({
      where: { userId: user.id },
      include: { ride: { include: { bookings: true } } },
      orderBy: { createdAt: "desc" },
    });

    const joinedRides = myBookings.map((b) => b.ride);

    console.log(
      `[GET /api/my-rides] found ${createdRides.length} created, ${joinedRides.length} joined`
    );

    return NextResponse.json({ createdRides, joinedRides });
  } catch (error) {
    console.error("[GET /api/my-rides] ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch your rides" },
      { status: 500 }
    );
  }
}