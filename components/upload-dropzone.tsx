"use client";

import { useId, useState } from "react";
import { FileImage, Upload } from "lucide-react";

export function UploadDropzone({
  min,
  max,
  helperText,
  name = "images",
}: {
  min: number;
  max: number;
  helperText?: string;
  name?: string;
}) {
  const [files, setFiles] = useState<string[]>([]);
  const inputId = useId();

  return (
    <label
      htmlFor={inputId}
      className="block cursor-pointer rounded-[24px] border border-dashed border-[var(--primary)] bg-white p-6 text-center shadow-[0_18px_55px_var(--shadow-soft)] transition hover:border-[var(--primary-dark)] hover:bg-[var(--soft-accent)]/35 sm:p-10"
    >
      <input
        id={inputId}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        multiple
        className="sr-only"
        onChange={(event) => {
          const nextFiles = Array.from(event.target.files ?? [])
            .slice(0, max)
            .map((file) => file.name);
          setFiles(nextFiles);
        }}
      />
      <span className="mx-auto inline-flex size-16 items-center justify-center rounded-[22px] bg-[var(--soft-accent)] text-[var(--primary-dark)]">
        <Upload size={30} aria-hidden="true" />
      </span>
      <p className="mt-5 text-2xl font-extrabold text-[var(--foreground)]">Drop photo here</p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
        {helperText ?? `You can upload JPG, PNG, WEBP files. This template requires ${min}-${max} photos.`}
      </p>
      {files.length > 0 ? (
        <div className="mx-auto mt-6 grid max-w-md gap-2 text-sm text-[var(--foreground)]">
          {files.map((file) => (
            <span
              key={file}
              className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-left font-bold"
            >
              <span className="inline-flex items-center gap-2 truncate">
                <FileImage size={16} aria-hidden="true" />
                <span className="truncate">{file}</span>
              </span>
              <span className="shrink-0 text-xs text-[var(--primary-dark)]">selected</span>
            </span>
          ))}
        </div>
      ) : null}
    </label>
  );
}
