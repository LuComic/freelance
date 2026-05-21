"use client";

import { useEffect, useState } from "react";

const LED_COUNT = 2400;
const LIT_LED_COUNT = 15;
const BLINK_INTERVAL_MS = 1200;

const DEFAULT_LIT_INDEXES = [
  119, 316, 533, 758, 1037, 1262, 1581, 1874, 2149, 2316,
];

const LED_COLORS = [
  "bg-slate-300/50",
  "bg-gray-300/50",
  "bg-zinc-300/50",
  "bg-neutral-300/50",
  "bg-stone-300/50",
  "bg-red-300/50",
  "bg-orange-300/50",
  "bg-amber-300/50",
  "bg-yellow-300/50",
  "bg-lime-300/50",
  "bg-green-300/50",
  "bg-emerald-300/50",
  "bg-teal-300/50",
  "bg-cyan-300/50",
  "bg-sky-300/50",
  "bg-blue-300/50",
  "bg-indigo-300/50",
  "bg-violet-300/50",
  "bg-purple-300/50",
  "bg-fuchsia-300/50",
  "bg-pink-300/50",
  "bg-rose-300/50",
];

function getRandomLitIndexes() {
  const indexes = new Set<number>();

  while (indexes.size < LIT_LED_COUNT) {
    indexes.add(Math.floor(Math.random() * LED_COUNT));
  }

  return indexes;
}

export function LedBackground() {
  const [litIndexes, setLitIndexes] = useState<Set<number>>(
    () => new Set(DEFAULT_LIT_INDEXES),
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setLitIndexes(getRandomLitIndexes());
    }, BLINK_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 min-h-screen overflow-hidden bg-(--dim)"
    >
      <div className="grid min-h-full grid-cols-[repeat(auto-fill,minmax(3.9rem,1fr))] auto-rows-[1.55rem] gap-2.5 p-1.5 opacity-55 sm:grid-cols-[repeat(auto-fill,minmax(4.6rem,1fr))] sm:auto-rows-[1.75rem] sm:gap-3">
        {Array.from({ length: LED_COUNT }, (_, index) => {
          const isLit = litIndexes.has(index);
          const color = LED_COLORS[(index * 7) % LED_COLORS.length];

          return (
            <span
              key={index}
              className={`h-full rounded-full transition-colors duration-300 ease-out ${
                isLit ? `${color}` : "bg-white/6"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
