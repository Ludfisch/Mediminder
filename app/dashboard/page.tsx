import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Brand } from "../components/brand";
import { ChartIcon, CheckIcon, ClockIcon, PillIcon, UserIcon } from "../components/icons";
import { LogoutButton } from "../components/logout-button";
import { DashboardClient } from "./dashboard-client";
import { getCurrentSession } from "@/src/lib/auth";
import { getPrisma } from "@/src/lib/prisma";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const user = await getPrisma().user.findUnique({
    where: { id: session.id },
    include: {
      medications: {
        orderBy: { time: "asc" },
        select: {
          id: true,
          name: true,
          dosage: true,
          time: true,
          barcode: true,
          imageType: true,
          logs: {
            where: {
              taken: true,
              createdAt: { gte: startOfDay, lt: endOfDay },
            },
            select: { id: true },
          },
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const medications = user.medications.map((medication) => ({
    id: medication.id,
    name: medication.name,
    dosage: medication.dosage,
    time: medication.time,
    barcode: medication.barcode,
    hasImage: Boolean(medication.imageType),
    takenToday: medication.logs.length > 0,
  }));
  const takenCount = medications.filter((medication) => medication.takenToday).length;
  const progress = medications.length
    ? Math.round((takenCount / medications.length) * 100)
    : 0;
  const nextMedication = medications.find((medication) => !medication.takenToday);
  const formattedDate = new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date());

  return (
    <main className="min-h-screen bg-[#f5f8f7]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Brand href="/dashboard" />
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden items-center gap-3 sm:flex">
              <span className="grid size-9 place-items-center rounded-full bg-teal-100 text-teal-800">
                <UserIcon className="size-5" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-bold text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-sm font-semibold capitalize text-teal-700">
              {formattedDate}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              Hallo {user.name.split(" ")[0]}, wie geht&apos;s dir heute?
            </h1>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-500 sm:text-right">
            Bitte halte dich immer an die Anweisungen deiner Ärztin, deines Arztes
            oder deiner Apotheke.
          </p>
        </div>

        <section aria-label="Tagesübersicht" className="my-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">Medikamente</span>
              <PillIcon className="size-5 text-teal-700" />
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
              {medications.length}
            </p>
            <p className="mt-1 text-sm text-slate-500">für deinen heutigen Plan</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">Erledigt</span>
              <CheckIcon className="size-5 text-teal-700" />
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
              {takenCount}
            </p>
            <p className="mt-1 text-sm text-slate-500">Einnahmen bestätigt</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">Fortschritt</span>
              <ChartIcon className="size-5 text-teal-700" />
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
              {progress}%
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-teal-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-teal-700 p-5 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-teal-100">Als Nächstes</span>
              <ClockIcon className="size-5 text-teal-200" />
            </div>
            <p className="mt-4 truncate text-xl font-bold tracking-tight">
              {nextMedication?.name ?? (medications.length ? "Alles erledigt" : "Noch offen")}
            </p>
            <p className="mt-1 text-sm text-teal-100">
              {nextMedication
                ? `${nextMedication.time} Uhr · ${nextMedication.dosage}`
                : medications.length
                  ? "Großartig gemacht"
                  : "Erstes Medikament hinzufügen"}
            </p>
          </div>
        </section>

        <DashboardClient
          medications={medications}
          pushConfigured={Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)}
        />
      </div>
    </main>
  );
}
