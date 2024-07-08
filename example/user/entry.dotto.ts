import { Entry } from "@dotto/worker/mod.ts";

export default function () {
  const configDir =
    Deno.env.get("XDG_CONFIG_HOME") ?? Deno.build.os === "windows"
      ? Deno.env.get("APPDATA")
      : "~/.config";

  return [
    {
      name: "tmux",
      paths: [{
        source: "tmux.conf",
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
  ] satisfies Entry;
}
