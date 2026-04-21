import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return Response.json({ error: "Acces refuse" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      active: true,
      createdAt: true,
      _count: { select: { sessions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(users);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return Response.json({ error: "Acces refuse" }, { status: 403 });
  }

  const { email, password, firstName, lastName, role } = await request.json();
  const { hash } = await import("bcryptjs");

  const hashedPassword = await hash(password, 12);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, firstName, lastName, role: role || "CANDIDATE" },
    select: { id: true, email: true, firstName: true, lastName: true, role: true },
  });

  return Response.json(user, { status: 201 });
}
