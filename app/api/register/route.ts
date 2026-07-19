import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import {
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/src/lib/auth";
import { getPrisma } from "@/src/lib/prisma";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Bitte fülle alle Felder aus." },
        { status: 400 },
      );
    }

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { error: "Bitte gib eine gültige E-Mail-Adresse ein." },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Das Passwort muss mindestens 8 Zeichen lang sein." },
        { status: 400 },
      );
    }

    const prisma = getPrisma();
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json(
        { error: "Für diese E-Mail-Adresse besteht bereits ein Konto." },
        { status: 409 },
      );
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await bcrypt.hash(password, 12),
      },
    });

    const response = NextResponse.json(
      {
        message: "Konto erfolgreich erstellt",
        user: { id: user.id, name: user.name, email: user.email },
      },
      { status: 201 },
    );

    response.cookies.set(
      SESSION_COOKIE,
      createSessionToken({ id: user.id, email: user.email }),
      sessionCookieOptions,
    );

    return response;
  } catch (error) {
    console.error("REGISTER_ERROR", error);
    return NextResponse.json(
      { error: "Das Konto konnte nicht erstellt werden." },
      { status: 500 },
    );
  }
}
