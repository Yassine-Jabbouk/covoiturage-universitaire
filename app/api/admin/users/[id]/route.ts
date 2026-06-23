import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/session";

// DELETE /api/admin/users/:id → delete a user and everything they own
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log(`[DELETE /api/admin/users/${id}] request received`);

  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      console.warn(`[DELETE /api/admin/users/${id}] not an admin, blocked`);
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    if (admin.id === id) {
      console.warn(
        `[DELETE /api/admin/users/${id}] admin tried to delete own account, blocked`
      );
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });

    if (!targetUser) {
      console.warn(`[DELETE /api/admin/users/${id}] user not found`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Order matters for foreign keys:
    // 1. Delete bookings made BY this user
    // 2. Delete bookings made ON rides owned by this user
    // 3. Delete rides owned by this user
    // 4. Delete the user
    await prisma.booking.deleteMany({ where: { userId: id } });

    const ownedRides = await prisma.ride.findMany({
      where: { userId: id },
      select: { id: true },
    });
    const ownedRideIds = ownedRides.map((r) => r.id);

    if (ownedRideIds.length > 0) {
      await prisma.booking.deleteMany({
        where: { rideId: { in: ownedRideIds } },
      });
      await prisma.ride.deleteMany({ where: { userId: id } });
    }

    await prisma.user.delete({ where: { id } });

    console.log(`[DELETE /api/admin/users/${id}] user and related data deleted`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[DELETE /api/admin/users/${id}] ERROR:`, error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}