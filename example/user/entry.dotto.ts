import { Entry } from "../../entryWorker.ts";

export default async function () {
  const configDir =
    Deno.env.get("XDG_CONFIG_HOME") ?? Deno.build.os === "windows"
      ? Deno.env.get("APPDATA")
      : "~/.config";

  return [
    {
      name: "tmux",
      entries: [{
        source: "tmux.conf",
        target: "~/tmux.conf",
      }],
      available: Deno.build.os === "linux",
    },
    {
      name: "wezterm",
      entries: [{
        source: "wezterm",
        target: `${configDir}/wezterm`,
      }],
    },
    {
      name: "PowerShell",
      entries: [{
        source: "PowerShell",
        target: "~/Documents/PowerShell",
      }],
      available: Deno.build.os === "windows",
    },
  ] satisfies Entry;
}
