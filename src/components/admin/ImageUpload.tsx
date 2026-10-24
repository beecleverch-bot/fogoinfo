"use client";

import { useState } from "react";
import { inputClass, useAdmin } from "./AdminGate";

export function ImageUpload({
  value,
  onChange,
  label = "Image",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const { supabase } = useAdmin();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setUploading(true);
    setError("");
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file, {
      contentType: file.type,
      cacheControl: "31536000",
    });
    setUploading(false);
    if (error) {
      setError(error.message);
      return;
    }
    onChange(supabase.storage.from("media").getPublicUrl(path).data.publicUrl);
  }

  return (
    <div>
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="img-frame h-24 w-36 shrink-0 rounded object-cover" />
        )}
        <div className="flex-1 space-y-2">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://… ou importer un fichier"
            className={inputClass}
          />
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
            className="text-sm"
          />
          {uploading && <p className="text-sm text-muted">Import en cours…</p>}
          {error && <p className="text-sm text-brand">{error}</p>}
        </div>
      </div>
    </div>
  );
}
