/// <reference no-default-lib="true" />
/// <reference lib="deno.worker" />

// This script is executed in a worker thread.

import * as v from "@valibot/valibot";
import { dirname } from "@std/path";
import { DottoDotfileError } from "~/common/error.ts";
import { resolve } from "~/utils/path.ts";

export type EntryWorkerArgs = {
  entryFiles: string[];
};

export type EntryWorkerResult = {
  multipleFileEntries: v.Output<typeof EntrySchema>[];
};

export const EntrySchema = v.array(v.object({
  name: v.string(),
  paths: v.array(v.object({
    source: v.string(),
    target: v.string(),
  })),
  available: v.optional(v.boolean()),
}));

self.onmessage = async (e) => {
  const args: EntryWorkerArgs = e.data;

  const multipleFileEntries: v.Output<typeof EntrySchema>[] = [];
  for (const entryPath of args.entryFiles) {
    const entryDir = dirname(entryPath);
    try {
      const { default: entryLoader } = await import(entryPath);
      if (typeof entryLoader !== "function") {
        throw new DottoDotfileError(
          `Entry loader must be a function: ${entryPath}`,
          { cause: e },
        );
      }
      const entries = v.parse(EntrySchema, await entryLoader());
      for (const entry of entries) {
        for (const path of entry.paths) {
          path.source = resolve(entryDir, path.source);
          path.target = resolve(entryDir, path.target);
        }
      }
      multipleFileEntries.push(entries);
    } catch (e) {
      throw new DottoDotfileError(`Error loading entry: ${entryPath}`, {
        cause: e,
      });
    }
  }

  self.postMessage({ multipleFileEntries } satisfies EntryWorkerResult);
};
