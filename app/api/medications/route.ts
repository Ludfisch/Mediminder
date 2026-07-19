import { NextResponse } from "next/server";
import { getCurrentSession } from "@/src/lib/auth";
import { getPrisma } from "@/src/lib/prisma";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
    }

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const dosage = typeof body.dosage === "string" ? body.dosage.trim() : "";
    const time = typeof body.time === "string" ? body.time.trim() : "";

    if (!name || !dosage || !TIME_PATTERN.test(time)) {
      return NextResponse.json(
        { error: "Bitte gib Name, Dosierung und eine gültige Uhrzeit an." },
        { status: 400 },
      );
    }

    const medication = await getPrisma().medication.create({
      data: { name, dosage, time, userId: session.id },
    });

    return NextResponse.json({ medication }, { status: 201 });
  } catch (error) {
    console.error("CREATE_MEDICATION_ERROR", error);
    return NextResponse.json(
      { error: "Das Medikament konnte nicht gespeichert werden." },
      { status: 500 },
    );
  }
}
