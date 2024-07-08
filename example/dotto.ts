import { DottoConfig, Entries } from "@dotto/worker/mod.ts";

/*
 * The dotto.ts file is first run with only read and env permissions to read "static" settings such as request permissions.
 * Next, once the specified permissions are granted to the user, the entry function is executed with those permissions.
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
          source: "user/wezterm",
          target: `${configDir}/wezterm`,
        }],
      },
      {
        name: "gitui",
        paths: [{
          source: "user/gitui",
          target: `${configDir}/gitui`,
        }],
      },
      {
        name: "PowerShell",
        paths: [{
          source: "user/PowerShell",
          target: "~/Documents/PowerShell",
        }],
        available: Deno.build.os === "windows",
      },
    ] satisfies Entries;
  },
};

export default config;
