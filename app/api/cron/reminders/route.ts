import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getPrisma } from "@/src/lib/prisma";
import { getWebPush } from "@/src/lib/push";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function hasValidSecret(request: Request) {
  const secret = process.env.CRON_SECRET;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (!secret || secret.length !== supplied.length) return false;
  return timingSafeEqual(Buffer.from(secret), Buffer.from(supplied));
}

function localParts(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
  };
}

export async function GET(request: Request) {
  if (!hasValidSecret(request)) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  const prisma = getPrisma();
  const now = new Date();
  const reminderOffsets = [0, 1, 2];
  const recent = new Date(now.getTime() - 36 * 60 * 60 * 1000);
  const subscriptions = await prisma.pushSubscription.findMany({
    include: {
      user: {
        include: {
          medications: {
            include: {
              logs: {
                where: { taken: true, takenAt: { gte: recent } },
                select: { takenAt: true },
              },
            },
          },
        },
      },
    },
  });

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const subscription of subscriptions) {
    let dueMinutes: ReturnType<typeof localParts>[];
    try {
      dueMinutes = reminderOffsets.map((offset) =>
        localParts(new Date(now.getTime() - offset * 60 * 1000), subscription.timezone),
      );
    } catch {
      failed += 1;
      continue;
    }

    for (const medication of subscription.user.medications) {
      const dueMinute = dueMinutes.find((candidate) => medication.time === candidate.time);
      if (!dueMinute) continue;

      const alreadyTaken = medication.logs.some(
        (log) => log.takenAt && localParts(log.takenAt, subscription.timezone).date === dueMinute.date,
      );
      if (alreadyTaken) {
        skipped += 1;
        continue;
      }

      const scheduledKey = `${dueMinute.date}T${medication.time}`;
      try {
        await prisma.pushDelivery.create({
          data: {
            subscriptionId: subscription.id,
            medicationId: medication.id,
            scheduledKey,
          },
        });
      } catch (error) {
        if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
          skipped += 1;
          continue;
        }
        throw error;
      }

      try {
        await getWebPush().sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          JSON.stringify({
            title: `Zeit für ${medication.name}`,
            body: `${medication.dosage} · ${medication.time} Uhr`,
            tag: `medication-${medication.id}-${scheduledKey}`,
            url: "/dashboard",
          }),
          { TTL: 60 * 60 },
        );
        sent += 1;
      } catch (error) {
        failed += 1;
        const statusCode =
          typeof error === "object" && error && "statusCode" in error
            ? Number(error.statusCode)
            : 0;

        if (statusCode === 404 || statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: subscription.id } });
          break;
        }

        await prisma.pushDelivery.deleteMany({
          where: { subscriptionId: subscription.id, medicationId: medication.id, scheduledKey },
        });
        console.error("PUSH_SEND_ERROR", error);
      }
    }
  }

  const cleanupBefore = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000);
  await prisma.pushDelivery.deleteMany({ where: { createdAt: { lt: cleanupBefore } } });

  return NextResponse.json({ checked: subscriptions.length, sent, skipped, failed });
}
