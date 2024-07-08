import { Checkbox, Confirm, prompt } from "@cliffy/prompt";

import { loadEntries } from "./entryLoader.ts";
import { State } from "~/common/state.ts";
import {
  DottoAnyError,
  DottoCancelledError,
  DottoUserCancelledError,
} from "~/common/error.ts";
import { resolve } from "~/utils/path.ts";
import { StaticConfig } from "~/common/config.ts";

export async function run_apply(
  dotfilesRoot: string,
  config: StaticConfig,
  state: State,
): Promise<void> {
  const s = state.read();
  if (s.applied && s.applied.rootDir !== dotfilesRoot) {
    if (
      await Confirm.prompt(
        `Another dotfiles at ${s.applied.rootDir} is already used. (Currently, multiple dotfiles is not supported.)\nDo you want to unlink current applied dotfiles?`,
      )
    ) {
      throw new Error("not implemented");
      // await state.update((s) => {
      //  s.applied = undefined;
      // })
    } else {
      throw new DottoUserCancelledError("Apply is cancelled.");
    }
  }

  if (!state.read().applied) {
    await state.update((s) => {
      s.applied = {
        rootDir: dotfilesRoot,
        installed: [],
      };
    });
  }

  const availableEntries = await loadEntries(
    dotfilesRoot,
    config.permissions,
    state,
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
    console.log(`Applying entry: ${entry.name}`);
    for (const { source: sourceRaw, target: targetRaw } of entry.paths) {
      const source = resolve(dotfilesRoot, sourceRaw);
      const target = resolve(dotfilesRoot, targetRaw);

      console.log(`  Linking: ${source} -> ${target}`);
      const targetExists = await Deno.stat(target).then(() => true).catch(() =>
        false
      );
      if (targetExists) {
        throw new DottoCancelledError(
          `Apply is aborted: Target already exists: ${target}.`,
        );
      }
      try {
        await Deno.symlink(source, target);
      } catch (e) {
        throw new DottoAnyError(
          `Apply is aborted: Failed to create symlink: ${source} -> ${target}.`,
          { cause: e },
        );
      }
    }
  }

  console.log("Apply completed");
}
