import chalk from "chalk";
import gradientString from "gradient-string";
import { checkbox as Checkbox, select as Select, input, Separator } from "@inquirer/prompts";
import wcswidth from "wcwidth";
import { SKILLS, TOOLS, detectInstalledTools } from "./constants.js";
import { installSkillToTool, uninstallSkillFromTool } from "./installer.js";

function printBanner() {
  console.clear();
  const banner = gradientString(["#4facfe", "#a855f7", "#f472b6"])("  LUMINAE HELPER  ");
  console.log("\n  " + banner);
  console.log(chalk.gray("  AI coding tools skill manager\n"));
}

/**
 * Pad a choice label to a consistent display width so icons don't misalign.
 */
function padChoice(text, targetWidth = 20) {
  const stripped = text.replace(/\x1b\[[0-9;]*m/g, "");
  const w = wcswidth(stripped);
  const pad = w < 0 ? 0 : Math.max(0, targetWidth - w);
  return text + " ".repeat(pad);
}

/**
 * Run a Checkbox prompt while listening for Escape keypresses.
 *
 * How it works:
 * - Sets stdin to raw mode for up to `timeoutMs` (or until the prompt resolves).
 * - If Esc (0x1b) is pressed first → resolve as "back".
 * - If Ctrl+C is pressed → throws ExitPromptError (caught by caller).
 * - If the checkbox resolves first → clean up raw mode and return the result.
 *
 * @param {Function} promptFn  - async function that returns the inquirer promise
 * @param {number}   timeoutMs - max ms to wait for Esc before giving up
 * @returns {"back"|"exit"|string[]}
 */
async function checkboxWithEsc(promptFn, timeoutMs = 5000) {
  let escReceived = false;
  let rawCleanup = null;

  const escListener = (data) => {
    // In raw mode, standalone Esc key sends a single 0x1b byte.
    // Arrow keys and other escape sequences send multi-byte sequences
    // starting with 0x1b (e.g. \x1b[A for up arrow), so we only
    // match a single-byte 0x1b to avoid false positives.
    if (Buffer.isBuffer(data) && data.length === 1 && data[0] === 0x1b) {
      escReceived = true;
    }
  };

  // Try to set raw mode; if not a TTY this is a no-op
  const tryRawMode = () => {
    try {
      if (!process.stdin.isTTY) return false;
      process.stdin.setRawMode(true);
      process.stdin.on("data", escListener);
      rawCleanup = () => {
        process.stdin.removeListener("data", escListener);
        process.stdin.setRawMode(false);
      };
      return true;
    } catch {
      return false;
    }
  };

  const isRaw = tryRawMode();

  const result = await Promise.race([
    // Esc race: wait at most timeoutMs for Esc, then give up
    new Promise((resolve) => {
      if (!isRaw) return setTimeout(() => resolve("esc_timeout"), timeoutMs);
      const timer = setTimeout(() => {
        rawCleanup && rawCleanup();
        resolve("esc_timeout");
      }, timeoutMs);
      // Store timer id so we can clear it if prompt resolves first
      rawCleanup._timer = timer;
    }),
    // Prompt race: resolve when the checkbox prompt resolves
    promptFn().then((val) => {
      if (isRaw && rawCleanup) {
        clearTimeout(rawCleanup._timer);
        rawCleanup();
      }
      return val;
    }),
  ]);

  if (escReceived) return "back";
  return result;
}

/**
 * Parse checkbox result: check for navigation values.
 * Returns "back" | "exit" | string[] (selected ids)
 */
function parseCheckboxResult(ans) {
  if (ans === "exit" || ans === "__exit__") return "exit";
  if (ans === "back" || ans === "__back__") return "back";
  if (Array.isArray(ans)) {
    if (ans.includes("__exit__")) return "exit";
    if (ans.includes("__back__")) return "back";
    return ans;
  }
  return ans;
}

/**
 * Build checkbox choices with separator + navigation items.
 * Navigation items are disabled so they cannot be toggled with space.
 * They still appear in the list and can be focused with arrow keys;
 * pressing Enter on a disabled item shows the "cannot be selected" message
 * but since Esc detection runs concurrently, users can Esc to go back.
 */
function withNavChoices(items, backLabel) {
  return [
    ...items,
    new Separator(),
    { name: chalk.yellow(backLabel), value: "__back__", disabled: true },
    { name: "✕  退出", value: "__exit__", disabled: true },
  ];
}

// ── Step 1: Select skills (checkbox multi-select) ──
async function stepSelectSkills() {
  while (true) {
    printBanner();
    console.log(chalk.cyan.bold("━━━ 选择 Skill ━━━\n"));

    const skillChoices = SKILLS.map(s => ({
      name: s.name + "  -  " + s.description,
      value: s.id,
    }));

    const theme = {
      prefix: chalk.cyan("◆"),
      style: { highlight: (t) => chalk.cyan(t) },
    };

    const ans = await checkboxWithEsc(() =>
      Checkbox({
        message: "  选择 Skill (空格切换，回车确认):",
        choices: withNavChoices(skillChoices, "↩  返回主菜单"),
        loop: false,
        theme,
      }).catch((err) => {
        if (err?.name === "ExitPromptError") return "exit";
        return "exit";
      })
    );

    const result = parseCheckboxResult(ans);

    if (result === "back") return "back";
    if (result === "exit") return "exit";

    if (result.length === 0) {
      console.log(chalk.yellow("\n  请至少选择一个 Skill"));
      await new Promise(r => setTimeout(r, 1200));
      continue;
    }

    return result;
  }
}

// ── Step 2: Select tools (checkbox multi-select) ──
async function stepSelectTools(installedTools) {
  while (true) {
    printBanner();
    console.log(chalk.cyan.bold("━━━ 选择目标工具 ━━━\n"));

    const toolChoices = installedTools.map(t => ({
      name: t.name,
      value: t.id,
    }));

    const theme = {
      prefix: chalk.cyan("◆"),
      style: { highlight: (t) => chalk.cyan(t) },
    };

    const ans = await checkboxWithEsc(() =>
      Checkbox({
        message: "  选择工具 (空格切换，回车确认):",
        choices: withNavChoices(toolChoices, "↩  返回上一步"),
        loop: false,
        theme,
      }).catch((err) => {
        if (err?.name === "ExitPromptError") return "exit";
        return "exit";
      })
    );

    const result = parseCheckboxResult(ans);

    if (result === "back") return "back";
    if (result === "exit") return "exit";

    if (result.length === 0) {
      console.log(chalk.yellow("\n  请至少选择一个工具"));
      await new Promise(r => setTimeout(r, 1200));
      continue;
    }

    return result;
  }
}

// ── Step 3: Preview + Confirm (Select with navigation) ──
async function stepPreviewConfirm(skillIds, toolIds, installedTools, isUninstall) {
  printBanner();
  const actionLabel = isUninstall ? "卸载" : "安装";
  console.log(chalk.cyan.bold("━━━ " + actionLabel + "预览 ━━━\n"));
  const skillNames = skillIds.map(id => SKILLS.find(s => s.id === id)?.name).join(", ");
  const toolNames = toolIds.map(id => installedTools.find(t => t.id === id)?.name).join(", ");
  console.log("  " + chalk.bold("Skill:") + "  " + skillNames);
  console.log("  " + chalk.bold("工具:") + "  " + toolNames);
  console.log();

  const ans = await Select({
    message: "  确认" + actionLabel + "？",
    choices: [
      { name: "✓  确认" + actionLabel, value: "confirm" },
      { name: "↩  返回上一步", value: "back" },
      { name: "✕  退出", value: "exit" },
    ],
    theme: { prefix: chalk.cyan("◆"), style: { highlight: (t) => chalk.cyan(t) } },
  }).catch(() => "back");

  return ans;
}

// ── Step 4: Execute ──
async function stepExecute(skillIds, toolIds, installedTools, isUninstall) {
  printBanner();
  console.log();
  console.log(chalk.cyan.bold("━━━ 执行中 ━━━\n"));

  let allSuccess = true;

  for (const toolId of toolIds) {
    const tool = TOOLS.find(t => t.id === toolId);
    if (!tool) continue;

    for (const skillId of skillIds) {
      const skill = SKILLS.find(s => s.id === skillId);
      if (!skill) continue;

      const supported = skill.installTargets?.some(tgt => tgt.toolId === toolId);
      if (!supported) {
        console.log(chalk.gray("  - " + skill.name + "  ×  " + tool.name + " (不支持)"));
        continue;
      }

      if (isUninstall) {
        const result = uninstallSkillFromTool(skill, tool);
        if (result.success) {
          console.log(chalk.green("  ✓ " + skill.name + "  ✓  " + tool.name));
        } else {
          console.log(chalk.yellow("  - " + skill.name + "  -  " + tool.name + " (未安装)"));
        }
      } else {
        const result = installSkillToTool(skill, tool);
        if (result.success) {
          console.log(chalk.green("  ✓ " + skill.name + "  →  " + tool.name));
        } else {
          console.log(chalk.red("  ✗ " + skill.name + "  →  " + tool.name + ": " + result.message));
          allSuccess = false;
        }
      }
    }
  }

  console.log();
  if (allSuccess) {
    console.log(chalk.green("  ✅ 操作完成！\n"));
  } else {
    console.log(chalk.yellow("  ⚠ 部分操作失败，请检查错误信息。\n"));
  }

  return allSuccess;
}

// ── Unified flow (install / uninstall) ──
async function runFlow(isUninstall) {
  const installedTools = detectInstalledTools().filter(t => t.installed);
  if (installedTools.length === 0) {
    printBanner();
    console.log(chalk.yellow("\n  ⚠ 未检测到任何已安装的 AI 工具\n"));
    console.log(chalk.gray("  请先安装以下工具之一:\n"));
    TOOLS.forEach(t => {
      console.log("  " + chalk.cyan(t.name) + ": " + chalk.gray(t.installHint));
    });
    console.log();
    await input({
      message: "  按回车返回主菜单...",
      theme: { prefix: chalk.cyan("◆"), style: { highlight: (t) => chalk.cyan(t) } },
    }).catch(() => {});
    return "back";
  }

  let step = 1;
  let selectedSkillIds = null;
  let selectedToolIds = null;

  while (true) {
    if (step === 1) {
      const result = await stepSelectSkills();
      if (result === "back") return "back";
      if (result === "exit") return "exit";
      selectedSkillIds = result;
      step = 2;
    } else if (step === 2) {
      const result = await stepSelectTools(installedTools);
      if (result === "back") { step = 1; continue; }
      if (result === "exit") return "exit";
      selectedToolIds = result;
      step = 3;
    } else if (step === 3) {
      const result = await stepPreviewConfirm(selectedSkillIds, selectedToolIds, installedTools, isUninstall);
      if (result === "back") { step = 2; continue; }
      if (result === "exit") return "exit";
      step = 4;
    } else if (step === 4) {
      await stepExecute(selectedSkillIds, selectedToolIds, installedTools, isUninstall);
      await input({
        message: "  按回车返回主菜单...",
        theme: { prefix: chalk.cyan("◆"), style: { highlight: (t) => chalk.cyan(t) } },
      }).catch(() => {});
      return "back";
    }
  }
}

// ── Main ──
export async function runInteractive() {
  let exit = false;

  while (!exit) {
    printBanner();

    const action = await Select({
      message: "  选择操作:",
      choices: [
        { name: padChoice("📦  安装 Skill", 20), value: "install" },
        { name: padChoice("🗑   卸载 Skill", 20), value: "uninstall" },
        { name: padChoice("✕  退出", 20), value: "exit" },
      ],
      theme: { prefix: chalk.cyan("◆"), style: { highlight: (t) => chalk.cyan(t) } },
    }).catch(() => "exit");

    if (action === "exit") {
      break;
    }

    const result = await runFlow(action === "uninstall");

    if (result === "exit") {
      exit = true;
    }
    // "back" or "done" → loop continues, show main menu again
  }

  console.log(chalk.gray("\n  👋 Bye!\n"));
  process.exit(0);
}
