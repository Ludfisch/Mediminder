"use client";

import Image from "next/image";
import { CameraIcon, CloseIcon } from "../components/icons";

type PackImagePickerProps = {
  value: string;
  onChange: (value: string) => void;
  onError: (message: string) => void;
};

const MAX_SOURCE_BYTES = 12_000_000;
const MAX_RESULT_BYTES = 240_000;

function dataUrlBytes(dataUrl: string) {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Math.ceil((base64.length * 3) / 4);
}

export function PackImagePicker({ value, onChange, onError }: PackImagePickerProps) {
  async function prepareImage(file: File) {
    if (!file.type.startsWith("image/") || file.size > MAX_SOURCE_BYTES) {
      onError("Bitte wähle ein Bild mit höchstens 12 MB aus.");
      return;
    }

    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      const scale = Math.min(480 / bitmap.width, 480 / bitmap.height, 1);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");

      if (!context) throw new Error("Canvas unavailable");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();

      let result = canvas.toDataURL("image/jpeg", 0.76);
      if (dataUrlBytes(result) > MAX_RESULT_BYTES) {
        result = canvas.toDataURL("image/jpeg", 0.56);
      }

      if (dataUrlBytes(result) > MAX_RESULT_BYTES) {
        onError("Das Foto konnte nicht klein genug gespeichert werden. Bitte fotografiere die Packung näher.");
        return;
      }

      onChange(result);
      onError("");
    } catch {
      onError("Dieses Bildformat konnte nicht verarbeitet werden. Bitte verwende ein neues Foto.");
    }
  }

  return (
    <div>
      <span className="text-sm font-semibold text-slate-200">Packungsbild (optional)</span>
      {value ? (
        <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
          <Image
            src={value}
            alt="Vorschau der fotografierten Medikamentenpackung"
            width={64}
            height={64}
            unoptimized
            className="size-16 rounded-xl bg-white object-contain"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white">Eigenes Foto ausgewählt</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Verkleinert und ohne Original-Metadaten gespeichert.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Packungsbild entfernen"
            className="grid size-9 place-items-center rounded-xl bg-white/10 text-slate-300 hover:bg-white/15"
          >
            <CloseIcon className="size-4" />
          </button>
        </div>
      ) : (
        <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 px-4 py-3 text-sm font-bold text-slate-200 transition hover:border-teal-400/50 hover:bg-white/10">
          <CameraIcon className="size-5" />
          Eigene Packung fotografieren
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void prepareImage(file);
              event.target.value = "";
            }}
          />
        </label>
      )}
      <p className="mt-2 text-xs leading-5 text-slate-500">
        Verwende nur ein selbst aufgenommenes Foto deiner eigenen Packung. Es bleibt privat in deinem Konto.
      </p>
    </div>
  );
}
