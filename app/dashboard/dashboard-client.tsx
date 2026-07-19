"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  CheckIcon,
  ClockIcon,
  PillIcon,
  PlusIcon,
  TrashIcon,
} from "../components/icons";
import { PushReminders } from "./push-reminders";

export type MedicationItem = {
  id: string;
  name: string;
  dosage: string;
  time: string;
  takenToday: boolean;
};

type DashboardClientProps = {
  medications: MedicationItem[];
  pushConfigured: boolean;
};

export function DashboardClient({ medications, pushConfigured }: DashboardClientProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState("08:00");
  const [message, setMessage] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  async function addMedication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsAdding(true);

    try {
      const response = await fetch("/api/medications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, dosage, time }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Das Medikament konnte nicht gespeichert werden.");
        return;
      }

      setName("");
      setDosage("");
      setTime("08:00");
      setMessage("Medikament wurde hinzugefügt.");
      router.refresh();
    } catch {
      setMessage("Der Server ist gerade nicht erreichbar.");
    } finally {
      setIsAdding(false);
    }
  }

  async function markAsTaken(id: string) {
    setPendingId(id);
    setMessage("");

    try {
      const response = await fetch(`/api/medications/${id}/take`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Die Einnahme konnte nicht gespeichert werden.");
        return;
      }

      router.refresh();
    } catch {
      setMessage("Der Server ist gerade nicht erreichbar.");
    } finally {
      setPendingId(null);
    }
  }

  async function removeMedication(id: string, medicationName: string) {
    if (!window.confirm(`${medicationName} wirklich aus deinem Plan entfernen?`)) {
      return;
    }

    setPendingId(id);
    setMessage("");

    try {
      const response = await fetch(`/api/medications/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Das Medikament konnte nicht gelöscht werden.");
        return;
      }

      router.refresh();
    } catch {
      setMessage("Der Server ist gerade nicht erreichbar.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PushReminders configured={pushConfigured} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-teal-700">
              Heutiger Plan
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              Deine Einnahmen
            </h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600">
            {medications.length} {medications.length === 1 ? "Eintrag" : "Einträge"}
          </span>
        </div>

        {message ? (
          <p
            role="status"
            className="mt-5 rounded-xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800"
          >
            {message}
          </p>
        ) : null}

        {medications.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-teal-100 text-teal-800">
              <PillIcon className="size-7" />
            </span>
            <h3 className="mt-5 text-lg font-bold text-slate-950">
              Noch keine Medikamente eingetragen
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">
              Nutze das Formular, um dein erstes Medikament und die gewünschte
              Einnahmezeit hinzuzufügen.
            </p>
          </div>
        ) : (
          <div className="mt-7 space-y-3">
            {medications.map((medication) => (
              <article
                key={medication.id}
                className={`group flex flex-col gap-4 rounded-2xl border p-4 transition sm:flex-row sm:items-center ${
                  medication.takenToday
                    ? "border-teal-100 bg-teal-50/70"
                    : "border-slate-200 bg-white hover:border-teal-200"
                }`}
              >
                <div
                  className={`grid size-12 shrink-0 place-items-center rounded-2xl ${
                    medication.takenToday
                      ? "bg-teal-700 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {medication.takenToday ? (
                    <CheckIcon className="size-6" />
                  ) : (
                    <PillIcon className="size-6" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-lg font-bold text-slate-950">
                    {medication.name}
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-500">{medication.dosage}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 font-mono text-sm font-semibold text-slate-700">
                    <ClockIcon className="size-4" />
                    {medication.time}
                  </span>

                  {!medication.takenToday ? (
                    <button
                      type="button"
                      onClick={() => markAsTaken(medication.id)}
                      disabled={pendingId === medication.id}
                      className="rounded-xl bg-teal-700 px-3.5 py-2 text-sm font-bold text-white transition hover:bg-teal-800 disabled:opacity-50"
                    >
                      {pendingId === medication.id ? "…" : "Eingenommen"}
                    </button>
                  ) : (
                    <span className="rounded-xl bg-teal-100 px-3.5 py-2 text-sm font-bold text-teal-800">
                      Erledigt
                    </span>
                  )}

                  <button
                    type="button"
                    aria-label={`${medication.name} löschen`}
                    onClick={() => removeMedication(medication.id, medication.name)}
                    disabled={pendingId === medication.id}
                    className="grid size-9 place-items-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <aside className="rounded-[1.75rem] bg-slate-950 p-5 text-white shadow-xl shadow-slate-950/10 sm:p-7">
        <span className="grid size-11 place-items-center rounded-2xl bg-teal-400 text-slate-950">
          <PlusIcon className="size-6" />
        </span>
        <h2 className="mt-5 text-2xl font-bold tracking-tight">Medikament hinzufügen</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Ergänze deinen Plan mit Name, Dosierung und täglicher Uhrzeit.
        </p>

        <form onSubmit={addMedication} className="mt-7 space-y-4">
          <div>
            <label htmlFor="medication-name" className="text-sm font-semibold text-slate-200">
              Medikament
            </label>
            <input
              id="medication-name"
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="z. B. Vitamin D"
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-teal-400 focus:ring-4 focus:ring-teal-400/10"
            />
          </div>

          <div>
            <label htmlFor="dosage" className="text-sm font-semibold text-slate-200">
              Dosierung
            </label>
            <input
              id="dosage"
              type="text"
              required
              value={dosage}
              onChange={(event) => setDosage(event.target.value)}
              placeholder="z. B. 1 Tablette"
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-teal-400 focus:ring-4 focus:ring-teal-400/10"
            />
          </div>

          <div>
            <label htmlFor="time" className="text-sm font-semibold text-slate-200">
              Uhrzeit
            </label>
            <input
              id="time"
              type="time"
              required
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none [color-scheme:dark] focus:border-teal-400 focus:ring-4 focus:ring-teal-400/10"
            />
          </div>

          <button
            type="submit"
            disabled={isAdding}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-400 px-4 py-3 font-bold text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <PlusIcon className="size-5" />
            {isAdding ? "Wird gespeichert …" : "Zum Plan hinzufügen"}
          </button>
        </form>
      </aside>
      </div>
    </div>
  );
}
