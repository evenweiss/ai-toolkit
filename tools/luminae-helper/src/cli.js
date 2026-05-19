#!/usr/bin/env node

import { runInteractive, TERM_GUTTER } from "./lib/ui.js";
import { printVersion, checkOutdated } from "./utils/version.js";

const args = process.argv.slice(2);

// --version / -v
if (args.includes("--version") || args.includes("-v")) {
  printVersion();
  process.exit(0);
}

// outdated 子命令
if (args[0] === "outdated") {
  await checkOutdated();
  process.exit(0);
}

// 默认：交互模式
async function main() {
  try {
    await runInteractive();
  } catch (error) {
    if (error?.name === "ExitPromptError") {
      console.log("\n" + TERM_GUTTER + "👋 Bye!\n");
      process.exit(0);
    }
    console.error("\n" + TERM_GUTTER + "Error:", error.message ?? String(error));
    process.exit(1);
  }
}

main();
