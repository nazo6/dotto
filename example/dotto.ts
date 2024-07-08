import { DottoConfig } from "@dotto/worker/mod.ts";
import { Entries } from "~/command/apply/entryWorker.ts";

/*
 * `dotto.ts` config file is executed once without any permissions to get permissions config.
 * After that, entry function is called with requested permissions.
 * So, don't do something require permissions outside entry function.
 */

const config: DottoConfig = {
  permissions: {
    "read": true,
  },
  entry: () => {
    const configDir =
      Deno.env.get("XDG_CONFIG_HOME") ?? Deno.build.os === "windows"
        ? Deno.env.get("APPDATA")
        : "~/.config";

    return [
      {
        name: "tmux",
        paths: [{
          source: "user/tmux.conf",
          target: "~/tmux.conf",
        }],
        available: Deno.build.os === "linux",
      },
      {
        name: "wezterm",
        paths: [{
          source: "wezterm",
          target: `${configDir}/wezterm`,
        }],
      },
      {
        name: "gitui",
        paths: [{
          source: "gitui",
          target: `${configDir}/gitui`,
        }],
      },
      {
        name: "PowerShell",
        paths: [{
          source: "PowerShell",
          target: "~/Documents/PowerShell",
        }],
        available: Deno.build.os === "windows",
      },
    ] satisfies Entries;
  },
};

export default config;
