import { Entries } from "../command/apply/entryWorker.ts";

export type DottoConfig = {
  permissions: Deno.PermissionOptionsObject;
  entry: () => Promise<Entries> | Entries;
};
export type { Entries };
