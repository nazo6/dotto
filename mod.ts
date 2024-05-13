import { Command } from "@cliffy/command";
import * as v from "@valibot/valibot";

import { loadState } from "./state.ts";
import { loadEntries } from "./entryLoader.ts";

export const ConfigSchema = v.object({
  workerPermissions: v.optional(v.any()),
});

export type InitOptions = {
  rootDir: string;
  workerPermissions?: Deno.PermissionOptions;
};

const cli = new Command()
  .name("dotto")
  .version("0.1.0")
  .description("Deno dotfiles manager");

export async function run(opts: InitOptions): Promise<void> {
  const cmd = await cli.parse(Deno.args);

  const rootDir = opts?.rootDir ?? Deno.cwd();

  const state = await loadState(rootDir);

  const entries = await loadEntries(rootDir);

  console.log(entries);
}

if (import.meta.main) {
  const rootDir = Deno.cwd();
  let configStr: string;
  try {
    configStr = await Deno.readTextFile(`${rootDir}/dotto.json`);
  } catch (e) {
    throw new Error("dotto.json not found");
  }
  const config = v.parse(ConfigSchema, JSON.parse(configStr));
  run({
    rootDir,
    ...config,
  });
}
