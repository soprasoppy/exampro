import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  // Pages publiques
  if (pathname === "/login" || pathname === "/register") {
    if (isLoggedIn) {
      const redirect = role === "ADMIN" ? "/admin" : role === "INSTRUCTOR" ? "/instructor/dashboard" : "/dashboard";
      return NextResponse.redirect(new URL(redirect, req.url));
    }
    return NextResponse.next();
  }

  // Protection des routes admin
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Protection des routes instructeur
  if (pathname.startsWith("/instructor")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (role !== "INSTRUCTOR" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Protection des routes candidat
  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // Rediriger l'instructeur vers son espace
    if (role === "INSTRUCTOR") {
      return NextResponse.redirect(new URL("/instructor/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // API protegees
  if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/instructor/:path*",
    "/dashboard/:path*",
    "/login",
    "/register",
    "/api/:path*",
  ],
};
