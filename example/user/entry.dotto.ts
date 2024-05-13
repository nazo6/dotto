export default async function () {
  return {
    name: "tmux",
    entries: [{
      source: "tmux.conf",
      target: "~/tmux.conf",
    }],
  };
}
