#!/usr/bin/env node

import { runInteractive } from "./lib/ui.js";

async function main() {
  try {
    await runInteractive();
  } catch (error) {
    if (error?.name === "ExitPromptError") {
      console.log("\n  👋 Bye!\n");
      process.exit(0);
    }
    console.error("\n  Error:", error.message ?? String(error));
    process.exit(1);
  }
}

main();
