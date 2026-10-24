"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// Rendu côté client pour que la date reste juste malgré le cache des pages.
export function Today() {
  const label = useSyncExternalStore(
    subscribe,
    () =>
      new Date().toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Africa/Conakry",
      }),
    () => "",
  );
  return <span className="capitalize">{label}</span>;
}
