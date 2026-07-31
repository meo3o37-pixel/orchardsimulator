import { createRequire } from "node:module";
import { EventEmitter } from "node:events";
import { pathToFileURL } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const childProcess = require("node:child_process");
const originalExec = childProcess.exec.bind(childProcess);

childProcess.exec = function patchedExec(command, options, callback) {
  let cb = callback;
  let opts = options;
  if (typeof options === "function") {
    cb = options;
    opts = undefined;
  }

  // Some Windows environments deny spawning "net use" (EPERM).
  // Vite calls this only as a best-effort optimization; safe to skip.
  if (typeof command === "string" && command.trim().toLowerCase() === "net use") {
    queueMicrotask(() => cb?.(null, "", ""));
    const fake = new EventEmitter();
    fake.pid = 0;
    fake.stdin = null;
    fake.stdout = null;
    fake.stderr = null;
    fake.kill = () => false;
    return fake;
  }

  return originalExec(command, opts, cb);
};

const [viteCommand = "dev", ...extraArgs] = process.argv.slice(2);
process.argv = [process.argv[0], "vite", viteCommand, ...extraArgs];
const vitePkgPath = require.resolve("vite/package.json");
const viteCliPath = path.join(path.dirname(vitePkgPath), "bin", "vite.js");
await import(pathToFileURL(viteCliPath).href);
