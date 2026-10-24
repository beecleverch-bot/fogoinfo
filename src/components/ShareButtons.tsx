"use client";

import { useState } from "react";

export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  function open(base: string) {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(title);
    window.open(base.replace("{url}", url).replace("{text}", text), "_blank", "noopener,width=600,height=500");
  }

  async function copy() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const btn = "rounded-full border border-line px-3 py-1.5 text-xs font-semibold hover:border-brand hover:text-brand";
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className={btn} onClick={() => open("https://www.facebook.com/sharer/sharer.php?u={url}")}>
        Facebook
      </button>
      <button type="button" className={btn} onClick={() => open("https://wa.me/?text={text}%20{url}")}>
        WhatsApp
      </button>
      <button type="button" className={btn} onClick={() => open("https://twitter.com/intent/tweet?text={text}&url={url}")}>
        X
      </button>
      <button type="button" className={btn} onClick={copy}>
        {copied ? "Lien copié ✓" : "Copier le lien"}
      </button>
    </div>
  );
}
