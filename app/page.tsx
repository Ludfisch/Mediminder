import Link from "next/link";
import { SiteHeader } from "./components/site-header";
import {
  ArrowRightIcon,
  ChartIcon,
  CheckIcon,
  ClockIcon,
  PillIcon,
  ShieldIcon,
  SparkleIcon,
} from "./components/icons";

const features = [
  {
    icon: ClockIcon,
    title: "Pünktlich erinnert",
    description:
      "Dein persönlicher Einnahmeplan zeigt dir klar, was heute wann ansteht.",
  },
  {
    icon: PillIcon,
    title: "Einfach organisiert",
    description:
      "Alle Medikamente, Dosierungen und Uhrzeiten übersichtlich an einem Ort.",
  },
  {
    icon: ChartIcon,
    title: "Fortschritt im Blick",
    description:
      "Abgehakte Einnahmen geben dir Sicherheit und machen deinen Tag planbar.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f8faf9]">
      <SiteHeader />

      <section className="relative">
        <div className="absolute inset-0 -z-0 [background-image:linear-gradient(to_right,#0f172a0a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a0a_1px,transparent_1px)] [background-size:36px_36px] [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" />
        <div className="absolute -right-36 top-10 size-[34rem] rounded-full bg-teal-200/45 blur-3xl" />
        <div className="absolute -left-40 bottom-0 size-96 rounded-full bg-cyan-100/70 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
          <div>
            <div className="animate-rise inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-3.5 py-2 text-sm font-semibold text-teal-800 shadow-sm backdrop-blur">
              <SparkleIcon className="size-4" />
              Mehr Sicherheit im Alltag
            </div>

            <h1 className="animate-rise animation-delay-150 mt-7 max-w-3xl text-5xl font-bold leading-[1.04] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-7xl">
              Medikamente im Blick.
              <br />
              <span className="text-teal-700">Den Kopf frei.</span>
            </h1>

            <p className="animate-rise animation-delay-300 mt-7 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">
              DosiTime hilft dir, deine Einnahmen zuverlässig zu planen und
              jeden Tag mit einem guten Gefühl abzuschließen.
            </p>

            <div className="animate-rise animation-delay-300 mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3.5 font-bold text-white shadow-[0_12px_30px_-12px_rgba(15,23,42,0.8)] transition hover:-translate-y-0.5 hover:bg-teal-800"
              >
                Jetzt kostenlos starten
                <ArrowRightIcon className="size-5" />
              </Link>
              <Link
                href="#so-funktionierts"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3.5 font-bold text-slate-700 shadow-sm transition hover:border-teal-200 hover:text-teal-800"
              >
                So funktioniert&apos;s
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
              {["Schnell eingerichtet", "Übersichtlich", "Datensparsam"].map(
                (item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <CheckIcon className="size-4 text-teal-700" />
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="absolute -inset-5 rotate-2 rounded-[2.5rem] bg-teal-700/10" />
            <div className="animate-float relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_40px_90px_-35px_rgba(15,23,42,0.45)] sm:p-7">
              <div className="flex items-start justify-between border-b border-slate-100 pb-6">
                <div>
                  <p className="text-sm font-semibold text-teal-700">Guten Morgen, Anna</p>
                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                    Dein Plan für heute
                  </h2>
                </div>
                <div className="grid size-11 place-items-center rounded-2xl bg-teal-50 text-teal-700">
                  <PillIcon className="size-6" />
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-300">Tagesfortschritt</p>
                    <p className="mt-1 text-3xl font-bold">2 von 3</p>
                  </div>
                  <div className="grid size-16 place-items-center rounded-full border-[6px] border-teal-400 text-sm font-bold">
                    67%
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full w-2/3 rounded-full bg-teal-400" />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  ["08:00", "Vitamin D", "1 Tablette", true],
                  ["13:00", "Magnesium", "2 Kapseln", true],
                  ["20:00", "Blutdruck", "5 mg", false],
                ].map(([time, name, dose, done]) => (
                  <div
                    key={String(name)}
                    className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4"
                  >
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-xl ${done ? "bg-teal-700 text-white" : "bg-amber-50 text-amber-700"}`}
                    >
                      {done ? <CheckIcon className="size-5" /> : <ClockIcon className="size-5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900">{String(name)}</p>
                      <p className="text-sm text-slate-500">{String(dose)}</p>
                    </div>
                    <span className="font-mono text-sm font-semibold text-slate-500">
                      {String(time)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="so-funktionierts" className="border-y border-slate-200 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">
              Einfach im Alltag
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              Alles, was du brauchst. Ohne unnötige Komplexität.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }, index) => (
              <article
                key={title}
                className="group rounded-[1.75rem] border border-slate-200 bg-[#fbfdfc] p-7 transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-950/5"
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-2xl bg-teal-100 text-teal-800 transition group-hover:bg-teal-700 group-hover:text-white">
                    <Icon className="size-6" />
                  </span>
                  <span className="font-mono text-sm text-slate-400">0{index + 1}</span>
                </div>
                <h3 className="mt-8 text-xl font-bold tracking-tight text-slate-950">
                  {title}
                </h3>
                <p className="mt-3 leading-7 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f8faf9] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-12 text-center text-white shadow-2xl shadow-slate-950/15 sm:px-12 sm:py-16">
            <div className="absolute left-1/2 top-0 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/25 blur-3xl" />
            <ShieldIcon className="relative mx-auto size-10 text-teal-300" />
            <h2 className="relative mt-5 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
              Bereit für einen entspannteren Alltag?
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl leading-7 text-slate-300">
              Erstelle deinen persönlichen Plan und behalte ab heute den Überblick.
            </p>
            <Link
              href="/register"
              className="relative mt-8 inline-flex items-center gap-2 rounded-2xl bg-teal-400 px-6 py-3.5 font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-teal-300"
            >
              DosiTime ausprobieren
              <ArrowRightIcon className="size-5" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} DosiTime</p>
          <p>Ein persönlicher Helfer – kein Ersatz für medizinische Beratung.</p>
        </div>
      </footer>
    </main>
  );
}
