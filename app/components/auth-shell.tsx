import Link from "next/link";
import type { ReactNode } from "react";
import { Brand } from "./brand";
import { CheckIcon, ShieldIcon } from "./icons";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footerText: string;
  footerLink: string;
  footerLabel: string;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footerText,
  footerLink,
  footerLabel,
}: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f8f7] px-5 py-8 sm:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(480px,0.82fr)] lg:p-0">
      <div className="absolute -left-24 top-24 size-80 rounded-full bg-teal-200/50 blur-3xl" />

      <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-slate-950 p-12 text-white lg:flex xl:p-16">
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_10%,#14b8a6_0,transparent_32%),radial-gradient(circle_at_90%_80%,#0f766e_0,transparent_28%)]" />
        <div className="relative">
          <Brand />
        </div>

        <div className="relative max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-300">
            Ruhiger durch den Alltag
          </p>
          <h2 className="mt-5 text-4xl font-bold leading-tight tracking-[-0.04em] xl:text-5xl">
            Deine Medikamente. Dein Rhythmus. Alles im Blick.
          </h2>
          <div className="mt-10 space-y-4 text-slate-300">
            {[
              "Persönlicher Einnahmeplan an einem Ort",
              "Übersichtlicher Tagesfortschritt",
              "Deine Gesundheitsdaten bleiben geschützt",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="grid size-7 place-items-center rounded-full bg-teal-400/15 text-teal-300">
                  <CheckIcon className="size-4" />
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-3 text-sm text-slate-400">
          <ShieldIcon className="size-5 text-teal-300" />
          <span>Entwickelt mit Datenschutz im Blick.</span>
        </div>
      </section>

      <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center lg:min-h-screen">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <Brand />
          </div>

          <div className="rounded-[2rem] border border-white bg-white/90 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-9">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 leading-7 text-slate-600">{description}</p>

            <div className="mt-8">{children}</div>

            <p className="mt-7 text-center text-sm text-slate-600">
              {footerText}{" "}
              <Link
                href={footerLink}
                className="font-bold text-teal-700 underline-offset-4 hover:underline"
              >
                {footerLabel}
              </Link>
            </p>
          </div>

          <Link
            href="/"
            className="mx-auto mt-6 block w-fit text-sm font-semibold text-slate-500 transition hover:text-slate-900"
          >
            ← Zurück zur Startseite
          </Link>
        </div>
      </section>
    </main>
  );
}
