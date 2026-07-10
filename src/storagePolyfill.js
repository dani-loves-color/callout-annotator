// The component was originally built as a Claude artifact, which provides a
// `window.storage` API (get/set/delete/list) backed by Anthropic's servers.
// Outside claude.ai that API doesn't exist, so this polyfills the same
// shape using localStorage — the component code itself needs no changes.
//
// Everything is stored under one localStorage key as a single JSON blob,
// which is plenty for this app's small amount of settings data (style
// presets, export preferences). It does NOT store your images or project
// files — use "Save project" in the app for that, which downloads a
// standalone .json file you keep wherever you like.

const LOCAL_KEY = "__callout_annotator_storage__";

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeAll(data) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
}

if (!window.storage) {
  window.storage = {
    async get(key) {
      const data = readAll();
      if (!(key in data)) throw new Error(`Key not found: ${key}`);
      return { key, value: data[key], shared: false };
    },
    async set(key, value) {
      const data = readAll();
      data[key] = value;
      writeAll(data);
      return { key, value, shared: false };
    },
    async delete(key) {
      const data = readAll();
      const existed = key in data;
      delete data[key];
      writeAll(data);
      return { key, deleted: existed, shared: false };
    },
    async list(prefix = "") {
      const data = readAll();
      return { keys: Object.keys(data).filter((k) => k.startsWith(prefix)), prefix, shared: false };
    },
  };
}
