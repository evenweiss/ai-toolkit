#!/usr/bin/env node

import { runInteractive, TERM_GUTTER } from "./lib/ui.js";

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
