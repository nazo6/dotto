import { toFileUrl } from "@std/path";
import { deepMerge } from "@std/collections/deep-merge";

import { walk } from "@svarta/walk-it";
import { Confirm } from "@cliffy/prompt";

import { EntryWorkerArgs, EntryWorkerResult } from "./entryWorker.ts";
import { State } from "~/common/state.ts";
import { DottoUserCancelledError } from "~/common/error.ts";

export async function loadEntries(
  rootDir: string,
  requestedPermissions: Deno.PermissionOptionsObject | null,
  state: State,
) {
  const workerPermissions = await getPermissions(
    rootDir,
    requestedPermissions,
    state,
  );

  const entryDirs: string[] = [];
  for await (
    const x of walk(rootDir, {
      filterFolder: (_, path) => {
        return !entryDirs.some((dir) => path.startsWith(dir));
      },
    })
  ) {
    if (x.files.some((file) => file.name === "entry.dotto.ts")) {
      entryDirs.push(x.dir);
    }
  }
  const entryFiles = entryDirs.map((dir) => `${dir}/entry.dotto.ts`);

  const worker = new Worker(import.meta.resolve("./entryWorker.ts"), {
    type: "module",
    // @ts-ignore Unstable API
    deno: {
      permissions: workerPermissions,
    },
  });
  worker.postMessage({ entryFiles } satisfies EntryWorkerArgs);
  const { multipleFileEntries } = await new Promise<EntryWorkerResult>(
    (resolve, reject) => {
      worker.onmessage = (e) => {
        resolve(e.data as EntryWorkerResult);
      };
      worker.onerror = (e) => {
        reject(e);
      };
    },
  );
  worker.terminate();

  return multipleFileEntries;
}

async function getPermissions(
  rootDir: string,
  requestedPermissions: Deno.PermissionOptionsObject | null,
  state: State,
) {
  const defaultWorkerPermissions: Deno.PermissionOptionsObject = {
    read: [toFileUrl(rootDir)],
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
