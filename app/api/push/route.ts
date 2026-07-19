import { NextResponse } from "next/server";
import { getCurrentSession } from "@/src/lib/auth";
import { getPrisma } from "@/src/lib/prisma";
import { getVapidPublicKey } from "@/src/lib/push";

type SubscriptionBody = {
  subscription?: {
    endpoint?: unknown;
    keys?: { p256dh?: unknown; auth?: unknown };
  };
  timezone?: unknown;
};

export async function GET() {
  const publicKey = getVapidPublicKey();
  if (!publicKey) {
    return NextResponse.json({ error: "Push ist noch nicht konfiguriert." }, { status: 503 });
  }
  return NextResponse.json({ publicKey });
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
    }

    const body = (await request.json()) as SubscriptionBody;
    const endpoint = typeof body.subscription?.endpoint === "string" ? body.subscription.endpoint : "";
    const p256dh = typeof body.subscription?.keys?.p256dh === "string" ? body.subscription.keys.p256dh : "";
    const auth = typeof body.subscription?.keys?.auth === "string" ? body.subscription.keys.auth : "";
    const timezone = typeof body.timezone === "string" ? body.timezone : "";

    try {
      new Intl.DateTimeFormat("de-DE", { timeZone: timezone }).format();
    } catch {
      return NextResponse.json({ error: "Ungültige Zeitzone." }, { status: 400 });
    }

    if (!endpoint.startsWith("https://") || !p256dh || !auth) {
      return NextResponse.json({ error: "Ungültige Push-Anmeldung." }, { status: 400 });
    }

    const subscription = await getPrisma().pushSubscription.upsert({
      where: { endpoint },
      update: { p256dh, auth, timezone, userId: session.id },
      create: { endpoint, p256dh, auth, timezone, userId: session.id },
      select: { id: true },
    });

    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error) {
    console.error("PUSH_SUBSCRIBE_ERROR", error);
    return NextResponse.json({ error: "Erinnerungen konnten nicht aktiviert werden." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
    }

    const body = (await request.json()) as { endpoint?: unknown };
    const endpoint = typeof body.endpoint === "string" ? body.endpoint : "";
    if (!endpoint) {
      return NextResponse.json({ error: "Push-Anmeldung fehlt." }, { status: 400 });
    }

    await getPrisma().pushSubscription.deleteMany({
      where: { endpoint, userId: session.id },
    });

    return NextResponse.json({ message: "Erinnerungen deaktiviert." });
  } catch (error) {
    console.error("PUSH_UNSUBSCRIBE_ERROR", error);
    return NextResponse.json({ error: "Erinnerungen konnten nicht deaktiviert werden." }, { status: 500 });
  }
}
