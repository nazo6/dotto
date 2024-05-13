import * as v from "@valibot/valibot";
import { Output } from "@valibot/valibot";
import { join } from "@std/path";

const STATE_FILE = "state.json";

const StateFileSchema = v.object({
  installed: v.array(v.string()),
});

export const DEFAULT_STATE = {
  installed: [],
};

export async function loadState(
  rootDir: string,
): Promise<Output<typeof StateFileSchema> | null> {
  const statePath = join(rootDir, STATE_FILE);
  let state: unknown;
  try {
    state = JSON.parse(await Deno.readTextFile(statePath));
  } catch {
    return null;
  }

  return v.parse(StateFileSchema, state);
}
