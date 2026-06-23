import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// POST /api/auth/register → create a new user with a hashed password
export async function POST(request: NextRequest) {
  console.log("[POST /api/auth/register] request received");

  try {
    const body = await request.json();
    console.log("[POST /api/auth/register] body received:", {
      ...body,
      password: "[hidden]",
    });

    const { name, email, password } = body;

    if (!name || !email || !password) {
      console.warn("[POST /api/auth/register] missing fields");
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      console.warn(
        `[POST /api/auth/register] email already in use: ${email}`
      );
      return NextResponse.json(
        { error: "This email is already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // role defaults to USER automatically, per the schema
      },
    });

    console.log(
      `[POST /api/auth/register] user created successfully, id: ${user.id}`
    );

    // Never send the password (even hashed) back to the client
    return NextResponse.json(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/auth/register] ERROR:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}