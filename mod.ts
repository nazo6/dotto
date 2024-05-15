import { Command } from "@cliffy/command";
import { Checkbox, prompt } from "@cliffy/prompt";
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
  const rootDir = opts?.rootDir ?? Deno.cwd();

  const state = await loadState(rootDir);

  const availableEntries = (await loadEntries(rootDir)).flat().filter((entry) =>
    entry.available ?? true
  );

  const { entries: selectedEntries } = await prompt([{
    name: "entries",
    message: "Select entries to install:",
    type: Checkbox,
    options: availableEntries.map((entry) => entry.name),
  }]);

  if (selectedEntries === undefined || selectedEntries.length === 0) {
    console.log("No entries selected");
    return;
  }

  for (const entry of availableEntries) {
    if (!selectedEntries.includes(entry.name)) {
      continue;
    }
    for (const { source, target } of entry.entries) {
      console.log(`Copying ${source} to ${target}`);
    }
  }
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
  await run({
    rootDir,
    ...config,
  });
}
