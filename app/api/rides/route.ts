import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// GET /api/rides → fetch all rides (public, anyone can view)
export async function GET() {
  console.log("[GET /api/rides] request received");

  try {
    const rides = await prisma.ride.findMany({
      orderBy: { time: "asc" },
      include: { bookings: true },
    });

    console.log(`[GET /api/rides] found ${rides.length} ride(s)`);
    return NextResponse.json(rides);
  } catch (error) {
    console.error("[GET /api/rides] ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch rides" },
      { status: 500 }
    );
  }
}

// POST /api/rides → create a new ride (must be logged in)
export async function POST(request: NextRequest) {
  console.log("[POST /api/rides] request received");

  try {
    const user = await getCurrentUser();

    if (!user) {
      console.warn("[POST /api/rides] no session, blocked");
      return NextResponse.json(
        { error: "You must be logged in to create a ride" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("[POST /api/rides] body received:", body);

    const { driverName, from, to, price, seats, time } = body;

    if (!driverName || !from || !to || !price || !seats || !time) {
      console.warn("[POST /api/rides] missing required fields:", body);
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const ride = await prisma.ride.create({
      data: {
        driverName,
        from,
        to,
        price: Number(price),
        seats: Number(seats),
        time: new Date(time),
        userId: user.id,
      },
      include: { bookings: true },
    });

    console.log("[POST /api/rides] ride created successfully, id:", ride.id);
    return NextResponse.json(ride, { status: 201 });
  } catch (error) {
    console.error("[POST /api/rides] ERROR:", error);
    return NextResponse.json(
      { error: "Failed to create ride" },
      { status: 500 }
    );
  }
}