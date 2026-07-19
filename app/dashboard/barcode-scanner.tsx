"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { IScannerControls } from "@zxing/browser";
import { BarcodeIcon, CameraIcon, CloseIcon } from "../components/icons";

type BarcodeScannerProps = {
  onDetected: (barcode: string) => void;
};

function normalizeBarcode(value: string) {
  const cleaned = value.trim().replace(/\u001d/g, "");
  const pzn = cleaned.match(/^(?:PZN-?|[-])(\d{7,8})$/i);
  if (pzn) return `PZN-${pzn[1]}`;

  const gtin = cleaned.match(/(?:^|\]d2)01(\d{14})/);
  if (gtin) return `GTIN-${gtin[1]}`;

  return cleaned.slice(0, 160);
}

export function BarcodeScanner({ onDetected }: BarcodeScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Kamera wird gestartet …");
  const [isPhotoScanning, setIsPhotoScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const onDetectedRef = useRef(onDetected);

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  const acceptBarcode = useCallback((rawValue: string) => {
    const barcode = normalizeBarcode(rawValue);
    if (!barcode) return;

    controlsRef.current?.stop();
    if ("vibrate" in navigator) navigator.vibrate(80);
    onDetectedRef.current(barcode);
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen || !videoRef.current) return;

    let cancelled = false;
    setError("");
    setStatus("Kamera wird gestartet …");

    const helpTimer = window.setTimeout(() => {
      if (!cancelled) {
        setStatus("Noch nichts erkannt. Gehe näher heran oder fotografiere den Barcode.");
      }
    }, 12_000);

    async function startScanner() {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        const reader = new BrowserMultiFormatReader(undefined, {
          delayBetweenScanAttempts: 100,
        });
        const controls = await reader.decodeFromConstraints(
          {
            audio: false,
            video: {
              facingMode: { ideal: "environment" },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
          },
          videoRef.current ?? undefined,
          (result) => {
            if (!result || cancelled) return;
            acceptBarcode(result.getText());
          },
        );

        if (cancelled) {
          controls.stop();
        } else {
          controlsRef.current = controls;
          setStatus("Kamera aktiv – suche Barcode …");
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
      window.clearTimeout(helpTimer);
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [acceptBarcode, isOpen]);

  async function scanPhoto(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Bitte wähle ein Foto des Barcodes aus.");
      return;
    }

    setError("");
    setIsPhotoScanning(true);
    setStatus("Foto wird nach einem Barcode durchsucht …");
    const imageUrl = URL.createObjectURL(file);

    try {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();
      const result = await reader.decodeFromImageUrl(imageUrl);
      acceptBarcode(result.getText());
    } catch {
      setError(
        "Auf dem Foto wurde kein Barcode erkannt. Fotografiere ihn näher, scharf und ohne Spiegelung.",
      );
      setStatus("Die Live-Kamera sucht weiter …");
    } finally {
      URL.revokeObjectURL(imageUrl);
      setIsPhotoScanning(false);
    }
  }

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
              <video ref={videoRef} autoPlay muted playsInline className="size-full object-cover" />
              <div className="pointer-events-none absolute inset-[16%] rounded-2xl border-2 border-teal-300 shadow-[0_0_0_999px_rgba(2,6,23,0.35)]" />
            </div>

            <p role="status" className="mt-4 flex items-center justify-center gap-2 text-center text-sm text-slate-300">
              <span className="size-2 shrink-0 animate-pulse rounded-full bg-teal-300" />
              {status}
            </p>

            {error ? (
              <p role="alert" className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            ) : (
              <p className="mt-3 text-center text-xs leading-5 text-slate-500">
                Tipp: Barcode groß im Rahmen, ruhige Hand, helles Licht und keine Spiegelung.
              </p>
            )}

            <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-slate-100 transition hover:border-teal-400/40 hover:bg-white/10">
              <CameraIcon className="size-5" />
              {isPhotoScanning ? "Foto wird geprüft …" : "Barcode fotografieren"}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                disabled={isPhotoScanning}
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void scanPhoto(file);
                  event.target.value = "";
                }}
              />
            </label>
            <p className="mt-2 text-center text-xs leading-5 text-slate-500">
              Kamera und Foto werden nur auf deinem Gerät ausgewertet und nicht hochgeladen.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
