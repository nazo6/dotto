import { walk } from "@svarta/walk-it";
import { EntryWorkerArgs, EntryWorkerResult } from "./entryWorker.ts";
import { toFileUrl } from "@std/path";

export async function loadEntries(
  rootDir: string,
  workerPermissions?: Deno.PermissionOptions,
) {
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
  const entryFilesPermission = {
    read: entryFiles.map((file) => toFileUrl(file)),
  };

  const worker = new Worker(import.meta.resolve("./entryWorker.ts"), {
    type: "module",
    // @ts-ignore Unstable API
    deno: {
      permissions: workerPermissions ?? entryFilesPermission,
    },
  });
  worker.postMessage({ entryFiles } satisfies EntryWorkerArgs);
  const { entries } = await new Promise<EntryWorkerResult>(
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

  return entries;
}
