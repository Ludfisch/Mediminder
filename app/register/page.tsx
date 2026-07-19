"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "../components/auth-shell";
import { ArrowRightIcon } from "../components/icons";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Das Konto konnte nicht erstellt werden.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Der Server ist gerade nicht erreichbar. Bitte versuche es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Dein Start mit DosiTime"
      title="In einer Minute eingerichtet."
      description="Lege dein Konto an und trage anschließend dein erstes Medikament ein."
      footerText="Du hast bereits ein Konto?"
      footerLink="/login"
      footerLabel="Zur Anmeldung"
    >
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label htmlFor="name" className="text-sm font-bold text-slate-800">
            Dein Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Anna Mustermann"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
          />
        </div>

        <div>
          <label htmlFor="email" className="text-sm font-bold text-slate-800">
            E-Mail-Adresse
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@beispiel.de"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
          />
        </div>

        <div>
          <label htmlFor="password" className="text-sm font-bold text-slate-800">
            Passwort
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Mindestens 8 Zeichen"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
          />
          <p className="mt-2 text-xs text-slate-500">Mindestens 8 Zeichen.</p>
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 font-bold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Konto wird erstellt …" : "Konto erstellen"}
          {!isSubmitting && <ArrowRightIcon className="size-5" />}
        </button>
      </form>
    </AuthShell>
  );
}
