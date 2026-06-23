import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/session";

// GET /api/admin/stats → counts + full ride/user lists for the admin dashboard
export async function GET() {
  console.log("[GET /api/admin/stats] request received");

  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      console.warn("[GET /api/admin/stats] not an admin, blocked");
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const [totalRides, totalUsers, totalBookings, rides, users] =
      await Promise.all([
        prisma.ride.count(),
        prisma.user.count(),
        prisma.booking.count(),
        prisma.ride.findMany({
          orderBy: { createdAt: "desc" },
          include: { bookings: true, user: { select: { name: true, email: true } } },
        }),
        prisma.user.findMany({
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            _count: { select: { rides: true, bookings: true } },
          },
        }),
      ]);

    console.log(
      `[GET /api/admin/stats] ${totalRides} rides, ${totalUsers} users, ${totalBookings} bookings`
    );

    return NextResponse.json({
      stats: { totalRides, totalUsers, totalBookings },
      rides,
      users,
    });
  } catch (error) {
    console.error("[GET /api/admin/stats] ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin data" },
      { status: 500 }
    );
  }
}