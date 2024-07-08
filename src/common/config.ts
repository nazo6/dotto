import { join, toFileUrl } from "@std/path";
import { DottoDotfileError } from "~/common/error.ts";
import { executeWorker } from "~/common/worker.ts";

export type StaticConfig = {
  permissions: Deno.PermissionOptionsObject;
};
export async function loadConfig(dir: string): Promise<StaticConfig> {
  const configPath = join(dir, "dotto.ts");
  try {
    await Deno.stat(configPath);
  } catch (e) {
    throw new DottoDotfileError(`Could not read dotto.ts at ${dir}`, {
      cause: e,
    });
  }
  const config: StaticConfig = await executeWorker(
    import.meta.resolve("./configWorker.ts"),
    { read: [toFileUrl(dir)], env: true },
    configPath,
  );

  return config;
}
