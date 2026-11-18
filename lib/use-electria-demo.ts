"use client";

import { useSyncExternalStore } from "react";
import { initialDemo, type Demo } from "./electria-demo";

const storageKey = "electria-sprint3-demo";
const changeEvent = "electria-demo-changed";
let cachedValue: string | null = null;
let cachedDemo = initialDemo;

function getSnapshot() {
  try {
    const value = window.localStorage.getItem(storageKey);
    if (value !== cachedValue) {
      cachedValue = value;
      cachedDemo = value ? (JSON.parse(value) as Demo) : initialDemo;
      if (
        !Array.isArray(cachedDemo?.listings) ||
        !Array.isArray(cachedDemo?.bookings) ||
        !Array.isArray(cachedDemo?.messages) ||
        !Array.isArray(cachedDemo?.blocks)
      ) {
        cachedDemo = initialDemo;
      }
    }
  } catch {
    return cachedDemo;
  }
  return cachedDemo;
}

function subscribe(onChange: () => void) {
  window.addEventListener(changeEvent, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(changeEvent, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useElectriaDemo() {
  return useSyncExternalStore(subscribe, getSnapshot, () => initialDemo);
}

export function updateDemo(change: (demo: Demo) => Demo) {
  const next = change(getSnapshot());
  try {
    const value = JSON.stringify(next);
    window.localStorage.setItem(storageKey, value);
    cachedValue = value;
  } catch {
    // Keep the demo usable when browser storage is unavailable.
  }
  cachedDemo = next;
  window.dispatchEvent(new Event(changeEvent));
}
