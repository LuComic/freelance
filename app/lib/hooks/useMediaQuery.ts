"use client";

import { useEffect, useLayoutEffect, useState } from "react";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState<boolean | null>(null);

  useIsomorphicLayoutEffect(() => {
    const mediaQueryList = window.matchMedia(query);

    const updateMatches = () => {
      setMatches(mediaQueryList.matches);
    };

    updateMatches();
    mediaQueryList.addEventListener("change", updateMatches);

    return () => mediaQueryList.removeEventListener("change", updateMatches);
  }, [query]);

  return matches;
}
