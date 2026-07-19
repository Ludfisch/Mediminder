import { NextResponse } from "next/server";
import { getCurrentSession } from "@/src/lib/auth";
import { getPrisma } from "@/src/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
    }

    const { id } = await params;
    const prisma = getPrisma();
    const medication = await prisma.medication.findFirst({
      where: { id, userId: session.id },
      select: { id: true },
    });

    if (!medication) {
      return NextResponse.json(
        { error: "Medikament nicht gefunden." },
        { status: 404 },
      );
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const existingLog = await prisma.medicationLog.findFirst({
      where: {
        medicationId: medication.id,
        taken: true,
        createdAt: { gte: startOfDay, lt: endOfDay },
      },
    });

    if (existingLog) {
      return NextResponse.json({ log: existingLog });
    }

    const log = await prisma.medicationLog.create({
      data: {
        medicationId: medication.id,
        taken: true,
        takenAt: new Date(),
      },
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (error) {
    console.error("TAKE_MEDICATION_ERROR", error);
    return NextResponse.json(
      { error: "Die Einnahme konnte nicht gespeichert werden." },
      { status: 500 },
    );
  }
}
