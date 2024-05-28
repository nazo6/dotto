import * as v from "@valibot/valibot";
import { join } from "@std/path";
import { DottoDotfileError } from "~/common/error.ts";

const DotfileConfigSchema = v.object({
  workerPermissions: v.optional(v.any()),
});
export type DotfileConfig = v.Output<typeof DotfileConfigSchema>;

export async function loadConfig(dir: string) {
  let configStr: string;
  try {
    configStr = await Deno.readTextFile(join(dir, "dotto.json"));
  } catch (_e) {
    return null;
  }

  try {
    return v.parse(DotfileConfigSchema, JSON.parse(configStr));
  } catch (e) {
    throw new DottoDotfileError(`Invalid dotto.json at ${dir}`, { cause: e });
  }
}
