import { NextResponse } from "next/server";
import { getCurrentSession } from "@/src/lib/auth";
import { getPrisma } from "@/src/lib/prisma";
import { getWebPush } from "@/src/lib/push";

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
    }

    const body = (await request.json()) as { endpoint?: unknown };
    const endpoint = typeof body.endpoint === "string" ? body.endpoint : "";
    if (!endpoint.startsWith("https://")) {
      return NextResponse.json({ error: "Ungültige Push-Anmeldung." }, { status: 400 });
    }

    const prisma = getPrisma();
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: session.id, endpoint },
    });

    if (subscriptions.length === 0) {
      return NextResponse.json({ error: "Auf keinem Gerät aktiviert." }, { status: 409 });
    }

    let sent = 0;
    for (const subscription of subscriptions) {
      try {
        await getWebPush().sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          JSON.stringify({
            title: "DosiTime-Test erfolgreich 🎉",
            body: "Benachrichtigungen funktionieren auf diesem Gerät.",
            tag: `dositime-test-${Date.now()}`,
            url: "/dashboard",
          }),
          { TTL: 5 * 60 },
        );
        sent += 1;
      } catch (error) {
        const statusCode =
          typeof error === "object" && error && "statusCode" in error
            ? Number(error.statusCode)
            : 0;

        if (statusCode === 404 || statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: subscription.id } });
          continue;
        }
        console.error("PUSH_TEST_ERROR", error);
      }
    }

    if (sent === 0) {
      return NextResponse.json({ error: "Kein Gerät erreichbar." }, { status: 502 });
    }

    return NextResponse.json({ sent });
  } catch (error) {
    console.error("PUSH_TEST_ROUTE_ERROR", error);
    return NextResponse.json({ error: "Test konnte nicht gesendet werden." }, { status: 500 });
  }
}
