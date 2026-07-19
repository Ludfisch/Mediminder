import Link from "next/link";
import { PillIcon } from "./icons";

export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-4"
    >
      <span className="grid size-9 place-items-center rounded-xl bg-teal-700 text-white shadow-sm transition-transform group-hover:-rotate-6">
        <PillIcon className="size-5" />
      </span>
      <span className="text-xl font-bold tracking-[-0.035em] text-slate-950">
        Dosi<span className="text-teal-700">Time</span>
      </span>
    </Link>
  );
}
