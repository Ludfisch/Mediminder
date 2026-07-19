import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import {
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/src/lib/auth";
import { getPrisma } from "@/src/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Bitte fülle alle Felder aus." },
        { status: 400 },
      );
    }

    const user = await getPrisma().user.findUnique({ where: { email } });
    const passwordCorrect = user
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!user || !passwordCorrect) {
      return NextResponse.json(
        { error: "E-Mail-Adresse oder Passwort ist nicht korrekt." },
        { status: 401 },
      );
    }

    const response = NextResponse.json({
      message: "Login erfolgreich",
      user: { id: user.id, name: user.name, email: user.email },
    });

    response.cookies.set(
      SESSION_COOKIE,
      createSessionToken({ id: user.id, email: user.email }),
      sessionCookieOptions,
    );

    return response;
  } catch (error) {
    console.error("LOGIN_ERROR", error);
    return NextResponse.json(
      { error: "Die Anmeldung konnte nicht abgeschlossen werden." },
      { status: 500 },
    );
  }
}
