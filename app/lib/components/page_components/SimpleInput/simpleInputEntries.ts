import type { PageComponentLiveStateByType } from "@/lib/pageDocument";

type SimpleInputEntry =
  PageComponentLiveStateByType<"SimpleInput">["state"]["inputs"][number];

export function createSimpleInputEntry(value: string): SimpleInputEntry {
  return {
    id: `input_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    value,
  };
}
