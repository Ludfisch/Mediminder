import { NextResponse } from "next/server";
import { getCurrentSession } from "@/src/lib/auth";
import { getPrisma } from "@/src/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
    }

    const { id } = await params;
    const result = await getPrisma().medication.deleteMany({
      where: { id, userId: session.id },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Medikament nicht gefunden." },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Medikament gelöscht." });
  } catch (error) {
    console.error("DELETE_MEDICATION_ERROR", error);
    return NextResponse.json(
      { error: "Das Medikament konnte nicht gelöscht werden." },
      { status: 500 },
    );
  }
}
