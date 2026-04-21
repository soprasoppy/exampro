import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    if (!email || !password || !firstName || !lastName) {
      return Response.json(
        { error: "Tous les champs sont obligatoires" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json(
        { error: "Cet email est deja utilise" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: "CANDIDATE",
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    return Response.json(user, { status: 201 });
  } catch {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
