"use client";

import { ImagePlus } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type ImageUploaderProps = {
  bucket: "sermon-images" | "hero-images";
  name: string;
  label: string;
  defaultValue?: string | null;
};

export function ImageUploader({
  bucket,
  name,
  label,
  defaultValue,
}: ImageUploaderProps) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [status, setStatus] = useState("");

  async function upload(file: File) {
    if (!isSupabaseConfigured()) {
      setStatus("Add Supabase env vars before uploading files.");
      return;
    }

    setStatus("Uploading...");
    const supabase = createClient();
    const extension = file.name.split(".").pop() ?? "jpg";
    const path = `${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: false,
    });

    if (error) {
      setStatus(error.message);
      return;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    setUrl(data.publicUrl);
    setStatus("Uploaded");
  }

  return (
    <div>
      <label className="text-sm font-semibold text-ink" htmlFor={`${name}-file`}>
        {label}
      </label>
      <input type="hidden" name={name} value={url} />
      <div className="mt-2 rounded-lg border border-dashed border-ink/20 bg-white p-4">
        <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-muted">
          <ImagePlus className="text-terracotta" size={22} />
          Upload image
          <input
            id={`${name}-file`}
            className="sr-only"
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
            }}
          />
        </label>
        <input
          className="mt-3 w-full rounded-md border border-ink/10 px-3 py-2 text-sm"
          placeholder="Or paste an image URL"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
        />
        {status && <p className="mt-2 text-xs text-muted">{status}</p>}
      </div>
    </div>
  );
}
