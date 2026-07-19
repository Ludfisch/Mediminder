"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogoutIcon } from "./icons";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function logout() {
    setIsPending(true);
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={isPending}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-950 disabled:opacity-50"
    >
      <LogoutIcon className="size-4" />
      <span className="hidden sm:inline">{isPending ? "Wird abgemeldet …" : "Abmelden"}</span>
    </button>
  );
}
