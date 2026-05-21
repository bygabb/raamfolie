import { NextResponse } from "next/server";
import { COOKIE_NAAM } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(
    new URL("/admin/login", request.url),
    303,
  );
  response.cookies.set(COOKIE_NAAM, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
