/// <reference no-default-lib="true" />
/// <reference lib="deno.worker" />

// This script is executed in a worker thread.

import * as v from "@valibot/valibot";
import { DottoDotfileError } from "~/common/error.ts";

export const EntriesSchema = v.array(v.object({
  name: v.string(),
  paths: v.array(v.object({
    source: v.string(),
    target: v.string(),
  })),
  available: v.optional(v.boolean()),
}));
export type Entries = v.Output<typeof EntriesSchema>;

self.onmessage = async (e) => {
  const configFilePath: string = e.data;

  try {
    const { default: config } = await import(configFilePath);
    if (typeof config?.entry !== "function") {
      throw new DottoDotfileError(
        `Entry loader must be a function: ${configFilePath}`,
        { cause: e },
      );
    }
    const entries = v.parse(EntriesSchema, await config.entry());
    self.postMessage(entries);
  } catch (e) {
    throw new DottoDotfileError(
      `Error loading entry from config: ${configFilePath}`,
      { cause: e },
    );
  }
};
