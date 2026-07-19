import { NextResponse } from "next/server";
import { getCurrentSession } from "@/src/lib/auth";
import { getPrisma } from "@/src/lib/prisma";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const IMAGE_PATTERN = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;
const MAX_IMAGE_BYTES = 250_000;

function hasExpectedImageSignature(image: Uint8Array, imageType: string) {
  if (imageType === "image/jpeg") {
    return image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff;
  }

  if (imageType === "image/png") {
    return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
      (byte, index) => image[index] === byte,
    );
  }

  return (
    imageType === "image/webp" &&
    String.fromCharCode(...image.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...image.slice(8, 12)) === "WEBP"
  );
}

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
    const barcode = typeof body.barcode === "string" ? body.barcode.trim() : "";
    const imageData = typeof body.packImage === "string" ? body.packImage : "";

    if (
      !name ||
      name.length > 100 ||
      !dosage ||
      dosage.length > 100 ||
      !TIME_PATTERN.test(time) ||
      barcode.length > 160
    ) {
      return NextResponse.json(
        { error: "Bitte gib Name, Dosierung und eine gültige Uhrzeit an." },
        { status: 400 },
      );
    }

    let image: Uint8Array<ArrayBuffer> | undefined;
    let imageType: string | undefined;

    if (imageData) {
      if (imageData.length > 350_000) {
        return NextResponse.json(
          { error: "Das Packungsbild ist zu groß." },
          { status: 413 },
        );
      }

      const match = IMAGE_PATTERN.exec(imageData);
      if (!match) {
        return NextResponse.json(
          { error: "Das Packungsbild hat ein ungültiges Format." },
          { status: 400 },
        );
      }

      image = Uint8Array.from(Buffer.from(match[2], "base64"));
      imageType = match[1];

      if (
        image.length > MAX_IMAGE_BYTES ||
        !hasExpectedImageSignature(image, imageType)
      ) {
        return NextResponse.json(
          { error: "Das Packungsbild ist ungültig oder zu groß." },
          { status: 400 },
        );
      }
    }

    const medication = await getPrisma().medication.create({
      data: {
        name,
        dosage,
        time,
        barcode: barcode || null,
        image,
        imageType,
        userId: session.id,
      },
      select: { id: true, name: true, dosage: true, time: true, barcode: true },
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
