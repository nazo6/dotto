/** Starts worker with permission and do `worker.postMessage` with supplied argument, and wait for worker returns value.
 * Once worker returned value, worker will be terminated.
 */
export async function executeWorker<ARG, RET>(
  workerPath: string | URL,
  permissions: Deno.PermissionOptionsObject,
  workerArgument: ARG,
): Promise<RET> {
  const worker = new Worker(workerPath, {
    type: "module",
    // @ts-ignore Unstable API
    deno: {
      permissions,
    },
  });
  worker.postMessage(workerArgument);
  const ret = await new Promise<RET>(
    (resolve, reject) => {
      worker.onmessage = (e) => {
        resolve(e.data as RET);
      };
      worker.onerror = (e) => {
        reject(e);
      };
    },
  );
  worker.terminate();

  return ret;
}
