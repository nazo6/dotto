import { join } from "@std/path";
import { deepMerge } from "@std/collections/deep-merge";

import { Confirm } from "@cliffy/prompt";

import { State } from "~/common/state.ts";
import { DottoUserCancelledError } from "~/common/error.ts";
import { executeWorker } from "~/common/worker.ts";
import { Entries } from "~/command/apply/entryWorker.ts";

export async function loadEntries(
  rootDir: string,
  requestedPermissions: Deno.PermissionOptionsObject | null,
  state: State,
): Promise<Entries> {
  const workerPermissions = await getPermissions(
    requestedPermissions,
    state,
  );

  const entries: Entries = await executeWorker(
    import.meta.resolve("./entryWorker.ts"),
    workerPermissions,
    join(rootDir, "dotto.ts"),
  );

  return entries;
}

async function getPermissions(
  requestedPermissions: Deno.PermissionOptionsObject | null,
  state: State,
) {
  const defaultWorkerPermissions: Deno.PermissionOptionsObject = {
    read: true,
    env: true,
  };
  const workerPermissions = requestedPermissions
    ? deepMerge(
      { ...defaultWorkerPermissions },
      { ...requestedPermissions },
    )
    : defaultWorkerPermissions;

  const s = state.read();
  if (
    s.applied
      ? !(JSON.stringify(workerPermissions) ===
        JSON.stringify(s.applied.allowedPermissions))
      : true
  ) {
    if (
      !await Confirm.prompt(
        `This dotfiles request the following permissions:\n${
          JSON.stringify(workerPermissions, null, 2)
        }\nDo you want to proceed?`,
      )
    ) {
      throw new DottoUserCancelledError(
        "User denied permissions requested by dotfiles.",
      );
    }
  }

  await state.update((s) => {
    if (!s.applied) {
      throw new Error("Called before applied. This should never happen.");
    }
    s.applied.allowedPermissions = workerPermissions;
  });

  return workerPermissions;
}
