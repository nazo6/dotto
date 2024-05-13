export default async function () {
  await Deno.readFile(".");
  return ["test", "test2"];
}
