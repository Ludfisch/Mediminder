"use client";

import { useEffect, useState } from "react";

type PushState = "loading" | "unsupported" | "off" | "on" | "blocked";

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
}

export function PushReminders({ configured }: { configured: boolean }) {
  const [state, setState] = useState<PushState>("loading");
  const [message, setMessage] = useState("");
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      queueMicrotask(() => setState("unsupported"));
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => {
        setState(subscription ? "on" : Notification.permission === "denied" ? "blocked" : "off");
      })
      .catch(() => setState("unsupported"));
  }, []);

  async function enablePush() {
    setMessage("");

    if (!configured) {
      setMessage("Push-Benachrichtigungen werden gerade noch eingerichtet.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "blocked" : "off");
        setMessage("Bitte erlaube Benachrichtigungen in den Einstellungen deines Geräts.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const publicKeyResponse = await fetch("/api/push");
      const { publicKey } = await publicKeyResponse.json();
      const subscription =
        (await registration.pushManager.getSubscription()) ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        }));

      const response = await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      if (!response.ok) {
        throw new Error("Subscription konnte nicht gespeichert werden.");
      }

      setState("on");
      setMessage("Erinnerungen sind auf diesem Gerät aktiviert.");
    } catch {
      setState("off");
      setMessage("Die Erinnerungen konnten noch nicht aktiviert werden.");
    }
  }

  async function disablePush() {
    setMessage("");
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/push", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setState("off");
      setMessage("Erinnerungen sind auf diesem Gerät ausgeschaltet.");
    } catch {
      setMessage("Die Einstellung konnte nicht geändert werden.");
    }
  }

  async function testPush() {
    setMessage("");
    setIsTesting(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) throw new Error("Keine Push-Anmeldung vorhanden.");

      const response = await fetch("/api/push/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
      if (!response.ok) throw new Error("Testbenachrichtigung fehlgeschlagen.");
      setMessage("Testbenachrichtigung wurde an dieses Gerät gesendet.");
    } catch {
      setMessage("Die Testbenachrichtigung konnte nicht gesendet werden.");
    } finally {
      setIsTesting(false);
    }
  }

  const active = state === "on";

  return (
    <section className="flex flex-col gap-4 rounded-[1.75rem] border border-teal-200 bg-gradient-to-r from-teal-50 to-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.15em] text-teal-700">Handy-Erinnerungen</p>
        <h2 className="mt-1 text-xl font-bold text-slate-950">
          {active ? "Benachrichtigungen sind aktiv" : "Keine Einnahme mehr vergessen"}
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
          DosiTime erinnert dich täglich zu den Uhrzeiten in deinem Plan – auch wenn die App geschlossen ist.
        </p>
        {state === "unsupported" ? (
          <p className="mt-2 text-sm font-semibold text-amber-700">Installiere DosiTime auf dem Home-Bildschirm und öffne es von dort erneut.</p>
        ) : null}
        {state === "blocked" ? (
          <p className="mt-2 text-sm font-semibold text-amber-700">Benachrichtigungen sind im Browser oder Gerät blockiert.</p>
        ) : null}
        {message ? <p className="mt-2 text-sm font-semibold text-teal-800" role="status">{message}</p> : null}
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:items-stretch">
        {active ? (
          <button
            type="button"
            onClick={testPush}
            disabled={isTesting}
            className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isTesting ? "Wird gesendet …" : "Testbenachrichtigung senden"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={active ? disablePush : enablePush}
          disabled={state === "loading" || state === "unsupported"}
          className={`rounded-xl px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${active ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" : "bg-teal-700 text-white hover:bg-teal-800"}`}
        >
          {state === "loading" ? "Wird geprüft …" : active ? "Ausschalten" : "Erinnerungen aktivieren"}
        </button>
      </div>
    </section>
  );
}
