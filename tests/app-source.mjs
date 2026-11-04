// The tests run the assembled app exactly as the build produces it (src/index.html + core bundle + src/app/*.js).
// Assembling first means a test never runs a stale build/ringzeit.html.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export function appHtml() {
  const build = fileURLToPath(new URL("../tools/build_pwa.py", import.meta.url));
  execFileSync("python3", [build, "--readable"], { stdio: "pipe" });
  return readFileSync(new URL("../build/ringzeit.html", import.meta.url), "utf8");
}
