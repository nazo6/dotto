import { dir } from "@cross/dir";
import { join } from "@std/path";
import type { Output } from "@valibot/valibot";
import * as v from "@valibot/valibot";
import { Confirm } from "jsr:@cliffy/prompt@^1.0.0-rc.4/confirm";
import { DottoAnyError } from "~/common/error.ts";

const DOTTO_DATA_DIR = join(await dir("data"), "dotto");
const STATE_PATH = join(await dir("data"), "dotto", "state.json");

const StateFileSchema = v.object({
  applied: v.optional(
    v.object({
      rootDir: v.string(),
      installed: v.array(v.string()),
      allowedPermissions: v.optional(v.any()),
    }),
  ),
});
export type StateType = Output<typeof StateFileSchema>;

const DEFAULT_STATE: StateType = {};

export class State {
  private state: StateType;
  path = STATE_PATH;
  constructor(state: StateType) {
    this.state = state;
  }

  read(): Readonly<StateType> {
    return this.state;
  }

  async update(
    updater: (state: StateType) => void,
  ): Promise<void> {
    updater(this.state);
    await Deno.writeTextFile(STATE_PATH, JSON.stringify(this.state, null, 2));
  }
}

export async function initState(): Promise<State> {
  let state: unknown;
  try {
    state = JSON.parse(await Deno.readTextFile(STATE_PATH));
  } catch {
    console.log("State file not found, creating a new one at", STATE_PATH);
    await Deno.mkdir(DOTTO_DATA_DIR, { recursive: true });
    await Deno.writeTextFile(
      STATE_PATH,
      JSON.stringify(DEFAULT_STATE, null, 2),
    );
    state = DEFAULT_STATE;
  }

  try {
    const stateParsed = v.parse(StateFileSchema, state);
    return new State(stateParsed);
  } catch (e) {
    if (
      await Confirm.prompt("State file is invalid. Do you want to reset it?")
    ) {
      return await initState();
    } else {
      throw new DottoAnyError("State file is invalid.", { cause: e });
    }
  }
}
