import { resolve as resolveStd } from "@std/path";

export function resolve(base: string, path: string): string {
  let notildePath;
  if (path.startsWith("~/") || path.startsWith("~\\") || path === "~") {
    notildePath = Deno.env.get("HOME") + path.slice(1);
  } else {
    notildePath = path;
  }

  return resolveStd(base, notildePath);
}
