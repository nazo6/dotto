/// <reference no-default-lib="true" />
/// <reference lib="deno.worker" />

// This script is executed in a worker thread.

import * as v from "@valibot/valibot";
import { DottoDotfileError } from "~/common/error.ts";

export type EntryWorkerArgs = {
  entryFiles: string[];
};

export type EntryWorkerResult = {
  entries: v.Output<typeof EntrySchema>[];
};

export const EntrySchema = v.array(v.object({
  name: v.string(),
  entries: v.array(v.object({
    source: v.string(),
    target: v.string(),
  })),
  available: v.optional(v.boolean()),
}));

self.onmessage = async (e) => {
  const args: EntryWorkerArgs = e.data;

  const entries: v.Output<typeof EntrySchema>[] = [];
  for (const entryPath of args.entryFiles) {
    try {
      const { default: entryLoader } = await import(entryPath);
      if (typeof entryLoader !== "function") {
        throw new DottoDotfileError(
          `Entry loader must be a function: ${entryPath}`,
          { cause: e },
        );
      }
      const entry = v.parse(EntrySchema, await entryLoader());
      entries.push(entry);
    } catch (e) {
      throw new DottoDotfileError(`Error loading entry: ${entryPath}`, {
        cause: e,
      });
    }
  }

  self.postMessage({ entries } satisfies EntryWorkerResult);
};
