/// <reference no-default-lib="true" />
/// <reference lib="deno.worker" />

// This script is executed in a worker thread.
// Loads 'static config' from config file.
// Static config is config that can be load without any config.

import * as v from "@valibot/valibot";
import { StaticConfig } from "~/common/config.ts";

export const ConfigSchema = v.object({
  permissions: v.any(),
  entry: v.any(),
});

self.onmessage = async (e) => {
  const configFilePath: string = e.data;
  const configRaw = await import(configFilePath);
  const config = v.parse(ConfigSchema, configRaw);

  self.postMessage(
    {
      permissions: config.permissions,
    } satisfies StaticConfig,
  );
};
