"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { CloseIcon } from "../components/icons";
import { BarcodeScanner } from "./barcode-scanner";
import { PackImagePicker } from "./pack-image-picker";

type EditableMedication = {
  id: string;
  name: string;
  dosage: string;
  time: string;
  barcode: string | null;
  hasImage: boolean;
};

type MedicationEditDialogProps = {
  medication: EditableMedication;
  onClose: () => void;
  onSaved: () => void;
};

export function MedicationEditDialog({ medication, onClose, onSaved }: MedicationEditDialogProps) {
  const [name, setName] = useState(medication.name);
  const [dosage, setDosage] = useState(medication.dosage);
  const [time, setTime] = useState(medication.time);
  const [barcode, setBarcode] = useState(medication.barcode ?? "");
  const [packImage, setPackImage] = useState("");
  const [removeImage, setRemoveImage] = useState(false);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function saveMedication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSaving(true);

    try {
      const response = await fetch(`/api/medications/${medication.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, dosage, time, barcode, packImage, removeImage }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || "Die Änderungen konnten nicht gespeichert werden.");
        return;
      }
      onSaved();
    } catch {
      setMessage("Der Server ist gerade nicht erreichbar.");
    } finally {
      setIsSaving(false);
    }
  }

  const showExistingImage = medication.hasImage && !removeImage && !packImage;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-medication-title"
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
      className="fixed inset-0 z-40 overflow-y-auto bg-slate-950/75 p-4 backdrop-blur-sm"
    >
      <div className="mx-auto my-4 w-full max-w-xl rounded-[1.75rem] border border-white/10 bg-slate-950 p-5 text-white shadow-2xl sm:my-10 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-teal-300">Bearbeiten</p>
            <h2 id="edit-medication-title" className="mt-1 text-2xl font-bold">Medikament anpassen</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Bearbeiten schließen"
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-slate-300 hover:bg-white/15"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>

        <form onSubmit={saveMedication} className="mt-6 space-y-4">
          <BarcodeScanner
            onDetected={(value) => {
              setBarcode(value);
              setMessage("Barcode erkannt.");
            }}
          />

          <div>
            <label htmlFor="edit-barcode" className="text-sm font-semibold text-slate-200">PZN / Barcode (optional)</label>
            <input
              id="edit-barcode"
              maxLength={160}
              value={barcode}
              onChange={(event) => setBarcode(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 font-mono text-white outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-400/10"
            />
          </div>

          <div>
            <label htmlFor="edit-name" className="text-sm font-semibold text-slate-200">Medikament</label>
            <input
              id="edit-name"
              autoFocus
              required
              maxLength={100}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-400/10"
            />
          </div>

          <div>
            <label htmlFor="edit-dosage" className="text-sm font-semibold text-slate-200">Dosierung</label>
            <input
              id="edit-dosage"
              required
              maxLength={100}
              value={dosage}
              onChange={(event) => setDosage(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-400/10"
            />
          </div>

          <div>
            <label htmlFor="edit-time" className="text-sm font-semibold text-slate-200">Uhrzeit</label>
            <input
              id="edit-time"
              type="time"
              required
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none [color-scheme:dark] focus:border-teal-400 focus:ring-4 focus:ring-teal-400/10"
            />
          </div>

          {showExistingImage ? (
            <div>
              <span className="text-sm font-semibold text-slate-200">Packungsbild</span>
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                <Image
                  src={`/api/medications/${medication.id}/image`}
                  alt={`Eigene Aufnahme der Packung von ${medication.name}`}
                  width={64}
                  height={64}
                  unoptimized
                  className="size-16 rounded-xl bg-white object-contain"
                />
                <p className="min-w-0 flex-1 text-sm font-semibold text-slate-200">Aktuelles privates Foto</p>
                <button
                  type="button"
                  onClick={() => setRemoveImage(true)}
                  className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/15"
                >
                  Ersetzen / entfernen
                </button>
              </div>
            </div>
          ) : (
            <>
              <PackImagePicker
                value={packImage}
                onChange={(value) => {
                  setPackImage(value);
                  if (value) setRemoveImage(true);
                }}
                onError={(error) => {
                  if (error) setMessage(error);
                }}
              />
              {medication.hasImage && removeImage && !packImage ? (
                <button
                  type="button"
                  onClick={() => setRemoveImage(false)}
                  className="text-sm font-semibold text-teal-300 hover:text-teal-200"
                >
                  Aktuelles Foto doch behalten
                </button>
              ) : null}
            </>
          )}

          {message ? (
            <p role="status" className="rounded-xl bg-teal-400/10 px-4 py-3 text-sm font-semibold text-teal-200">
              {message}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/15 px-5 py-3 text-sm font-bold text-slate-200 hover:bg-white/10"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-teal-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-teal-300 disabled:opacity-60"
            >
              {isSaving ? "Wird gespeichert …" : "Änderungen speichern"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
