import { Command } from "@cliffy/command";
import * as colors from "@std/fmt/colors";

import { run_apply } from "~/command/apply/mod.ts";
import { loadConfig } from "~/common/config.ts";
import { initState } from "~/common/state.ts";
import { DottoError } from "~/common/error.ts";

if (import.meta.main) {
  await main();
}

async function main() {
  try {
    await mainInner();
  } catch (e) {
    if (e instanceof DottoError) {
      console.error(
        `${colors.bgRed(` ${e.name} `)} ${colors.red(e.message)}${
          e.cause ? colors.gray("\nCaused by: " + e.cause) : ""
        }`,
      );
      Deno.exit(1);
    } else {
      throw e;
    }
  }
}

async function mainInner() {
  const rootDir = Deno.cwd();
  const state = await initState();

  await new Command()
    .name("dotto")
    .version("0.1.0")
    .description("Deno dotfiles manager")
    .action(() => {
      console.log(
        "Please specify a subcommand. You can use --help to see available subcommands.",
      );
    })
    .command("apply", "Apply dotfiles at working directory")
    .action(async () => {
      const config = await loadConfig(rootDir);

      await run_apply(
        rootDir,
        config,
        state,
      );
    })
    .command("state", "Show current state")
    .action(() => {
      console.log("State path:", state.path);
      console.log("State content:", JSON.stringify(state.read(), null, 2));
    })
    .parse(Deno.args);
}
