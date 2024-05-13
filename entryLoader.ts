import * as v from "@valibot/valibot";
import { walk } from "@svarta/walk-it";
import { join } from "@std/path";

const EntrySchema = v.array(v.string());

export async function loadEntries(rootDir: string) {
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

  const entries: v.Output<typeof EntrySchema>[] = [];
  for (const dir of entryDirs) {
    const entryPath = join(dir, "entry.dotto.ts");
    try {
      const { default: entryLoader } = await import(entryPath);
      if (typeof entryLoader !== "function") {
        throw new Error(`Entry loader must be a function: ${entryPath}`);
      }
      const entry = v.parse(EntrySchema, await entryLoader());
      entries.push(entry);
    } catch (e) {
      throw new Error(`Error loading entry: ${entryPath}\n${e.stack}`);
    }
  }

  console.log(entries);
}
