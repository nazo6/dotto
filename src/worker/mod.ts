import * as v from "@valibot/valibot";
import { EntrySchema } from "../command/apply/entryWorker.ts";

export type Entry = v.Output<typeof EntrySchema>;
