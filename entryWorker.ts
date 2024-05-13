/// <reference no-default-lib="true" />
/// <reference lib="deno.worker" />

import * as v from "@valibot/valibot";

export type EntryWorkerArgs = {
  entryFiles: string[];
};

export type EntryWorkerResult = {
  entries: v.Output<typeof EntrySchema>[];
};

const EntrySchema = v.object({
  name: v.string(),
  entries: v.array(v.object({
    source: v.string(),
    target: v.string(),
  })),
});

self.onmessage = async (e) => {
  const args: EntryWorkerArgs = e.data;

  const entries: v.Output<typeof EntrySchema>[] = [];
  for (const entryPath of args.entryFiles) {
    try {
      const { default: entryLoader } = await import(entryPath);
      if (typeof entryLoader !== "function") {
        throw new Error(`Entry loader must be a function: ${entryPath}`);
      }
      const entry = v.parse(EntrySchema, await entryLoader());
      entries.push(entry);
    } catch (e) {
      throw new Error(`Error loading entry: ${entryPath}\n${e.stack}`);
    }
  }

  self.postMessage({ entries } satisfies EntryWorkerResult);
};
