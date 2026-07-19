"use client";

import { useEffect, useRef, useState } from "react";
import type { IScannerControls } from "@zxing/browser";
import { BarcodeIcon, CloseIcon } from "../components/icons";

type BarcodeScannerProps = {
  onDetected: (barcode: string) => void;
};

function normalizeBarcode(value: string) {
  const cleaned = value.trim().replace(/\u001d/g, "");
  const pzn = cleaned.match(/^(?:PZN-?|[-])?(\d{7,8})$/i);
  if (pzn) return `PZN-${pzn[1]}`;

  const gtin = cleaned.match(/(?:^|\]d2)01(\d{14})/);
  if (gtin) return `GTIN-${gtin[1]}`;

  return cleaned.slice(0, 160);
}

export function BarcodeScanner({ onDetected }: BarcodeScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const onDetectedRef = useRef(onDetected);

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  useEffect(() => {
    if (!isOpen || !videoRef.current) return;

    let cancelled = false;
    setError("");

    async function startScanner() {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        const reader = new BrowserMultiFormatReader();
        const controls = await reader.decodeFromConstraints(
          {
            audio: false,
            video: { facingMode: { ideal: "environment" } },
          },
          videoRef.current ?? undefined,
          (result) => {
            if (!result || cancelled) return;
            const barcode = normalizeBarcode(result.getText());
            if (!barcode) return;

            controlsRef.current?.stop();
            onDetectedRef.current(barcode);
            setIsOpen(false);
          },
        );

        if (cancelled) {
          controls.stop();
        } else {
          controlsRef.current = controls;
        }
      } catch {
        setError(
          "Die Kamera konnte nicht geöffnet werden. Erlaube den Kamerazugriff oder trage den Code manuell ein.",
        );
      }
    }

    void startScanner();

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-teal-400/30 bg-teal-400/10 px-4 py-3 text-sm font-bold text-teal-200 transition hover:bg-teal-400/20"
      >
        <BarcodeIcon className="size-5" />
        Barcode mit Kamera scannen
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="barcode-dialog-title"
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/85 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-lg rounded-[1.75rem] border border-white/10 bg-slate-950 p-5 text-white shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="barcode-dialog-title" className="text-xl font-bold">
                  Packung scannen
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Halte PZN, EAN oder DataMatrix gut sichtbar in den Rahmen.
                </p>
              </div>
              <button
                type="button"
                aria-label="Scanner schließen"
                onClick={() => setIsOpen(false)}
                className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-slate-300 hover:bg-white/15"
              >
                <CloseIcon className="size-5" />
              </button>
            </div>

            <div className="relative mt-5 aspect-[4/3] overflow-hidden rounded-2xl bg-black">
              <video ref={videoRef} muted playsInline className="size-full object-cover" />
              <div className="pointer-events-none absolute inset-[16%] rounded-2xl border-2 border-teal-300 shadow-[0_0_0_999px_rgba(2,6,23,0.35)]" />
            </div>

            {error ? (
              <p role="alert" className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            ) : (
              <p className="mt-4 text-center text-sm text-slate-400">
                Die Kameraaufnahme wird nicht hochgeladen.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
