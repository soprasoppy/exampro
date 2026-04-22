import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Non authentifie" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      image: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    return Response.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  return Response.json(user);
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Non authentifie" }, { status: 401 });
  }

  const body = await request.json();
  const updateData: Record<string, unknown> = {};

  if (body.firstName) updateData.firstName = body.firstName;
  if (body.lastName) updateData.lastName = body.lastName;

  if (body.newPassword) {
    if (!body.currentPassword) {
      return Response.json({ error: "Mot de passe actuel requis" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user?.password) {
      return Response.json({ error: "Compte Google, impossible de changer le mot de passe" }, { status: 400 });
    }

    const { compare, hash } = await import("bcryptjs");
    const isValid = await compare(body.currentPassword, user.password);
    if (!isValid) {
      return Response.json({ error: "Mot de passe actuel incorrect" }, { status: 400 });
    }

    if (body.newPassword.length < 6) {
      return Response.json({ error: "Le nouveau mot de passe doit contenir au moins 6 caracteres" }, { status: 400 });
    }

    updateData.password = await hash(body.newPassword, 12);
  }

  if (Object.keys(updateData).length === 0) {
    return Response.json({ error: "Aucune modification" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      image: true,
      role: true,
    },
  });

  return Response.json(updated);
}
