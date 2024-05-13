import { Command } from "@cliffy/command";

import { loadState } from "./state.ts";
import { loadEntries } from "./entryLoader.ts";

export type InitOptions = {
  rootDir?: string;
};

const cli = new Command()
  .name("dotto")
  .version("0.1.0")
  .description("Deno dotfiles manager");

export async function run(opts?: InitOptions): Promise<void> {
  const cmd = await cli.parse(Deno.args);

  const rootDir = opts?.rootDir ?? Deno.cwd();

  const state = await loadState(rootDir);

  await loadEntries(rootDir);
}
