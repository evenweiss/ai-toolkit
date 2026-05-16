import chalk from "chalk";
import gradientString from "gradient-string";
import { select as Select, input, Separator } from "@inquirer/prompts";
import wcswidth from "wcwidth";
import checkboxWithActionRows from "./checkbox-with-action-rows.js";
import { SKILLS, TOOLS, detectInstalledTools } from "./constants.js";
import { installSkillToTool, uninstallSkillFromTool } from "./installer.js";

/**
 * 终端主内容区左侧统一的两空格缩进（与顶栏、收尾、错误提示对齐）。
 * 所有面向用户的 `console.log` / 区块标题应以此开头，避免有的顶格、有的多空格。
 */
export const TERM_GUTTER = "  ";

/**
 * 传给所有 @inquirer prompt 的 context。
 * `clearPromptOnDone: true` 会在 prompt 结束时用 ANSI 擦除整块 TUI 占用的行，
 * 避免默认「只换行」导致旧菜单残留在终端上，与下一屏叠在一起（尤其快速按方向键时）。
 * @type {{ clearPromptOnDone: boolean }}
 */
const inquirerContext = { clearPromptOnDone: true };

/**
 * 在关闭一个 inquirer prompt 之后、再 `printBanner` 或打开下一个 prompt 之前调用。
 * 使用 `setImmediate` 推迟到当前轮询阶段之后，让 readline 的 `close`、MuteStream 的 flush
 * 以及 stdin 里积压的字节先落稳（与 Inquirer.js #1303 讨论的背景一致），降低两屏叠画的概率。
 * @returns {Promise<void>}
 */
function afterPromptFlush() {
  return new Promise((resolve) => {
    setImmediate(resolve);
  });
}

/**
 * 打印步骤区块标题（青粗体 + 统一左侧 gutter + 段后空行）。
 * @param {string} title 标题全文，例如「━━━ 选择 Skill ━━━」
 */
function printSectionTitle(title) {
  console.log(chalk.cyan.bold(TERM_GUTTER + title + "\n"));
}

function printBanner() {
  console.clear();
  const banner = gradientString(["#4facfe", "#a855f7", "#f472b6"])("  LUMINAE HELPER  ");
  console.log("\n" + TERM_GUTTER + banner);
  console.log(chalk.gray(TERM_GUTTER + "AI coding tools' skills manager\n"));
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
 * 解析带功能行的多选结果：`__back__` / `__exit__` 来自「焦点在该行时按回车」的即时提交；
 * 普通 Skill/工具 id 来自多选勾选后回车。若数组中同时含功能值与普通 id，优先按功能处理。
 *
 * @param {unknown} ans
 * @returns {"back"|"exit"|string[]}
 */
function parseCheckboxResult(ans) {
  if (ans === "exit" || ans === "__exit__") return "exit";
  if (ans === "back" || ans === "__back__") return "back";
  if (ans === "esc_timeout") return "back";
  if (Array.isArray(ans)) {
    if (ans.includes("__exit__")) return "exit";
    if (ans.includes("__back__")) return "back";
    return ans.filter((x) => x !== "__back__" && x !== "__exit__");
  }
  return "back";
}

/**
 * 在列表末尾追加「返回 / 退出」两项（`value` 为 `__back__` / `__exit__`）。
 * 由 `checkbox-with-action-rows` 渲染为功能行：方向键移上去后按回车即触发，空格不会勾选。
 *
 * @param {{ name: string, value: string }[]} items
 * @param {string} backLabel
 */
function withNavChoices(items, backLabel) {
  return [
    ...items,
    new Separator(),
    { name: chalk.yellow(backLabel), value: "__back__" },
    { name: "✕ 退出", value: "__exit__" },
  ];
}

/**
 * 运行带功能行的多选 Checkbox（见 `checkbox-with-action-rows.js`）。
 * Ctrl+C 时按项目惯例视为退出整段交互。
 *
 * @param {{ message: string, choices: unknown[], loop?: boolean, theme?: object }} config
 * @returns {Promise<string[]>}
 */
async function runCheckbox(config) {
  return checkboxWithActionRows(config, inquirerContext).catch((err) => {
    if (err?.name === "ExitPromptError") return ["__exit__"];
    return ["__exit__"];
  });
}

// ── Step 1: Select skills (checkbox multi-select) ──
async function stepSelectSkills() {
  while (true) {
    await afterPromptFlush();
    printBanner();
    printSectionTitle("━━━ 选择 Skill ━━━");

    const skillChoices = SKILLS.map(s => ({
      name: s.name + "  -  " + s.description,
      value: s.id,
    }));

    const theme = {
      prefix: chalk.cyan(" ◆"),
      style: { highlight: (t) => chalk.cyan(t) },
    };

    const ans = await runCheckbox({
      message: "选择 Skill:",
      choices: withNavChoices(skillChoices, "↩ 返回主菜单"),
      loop: false,
      theme,
    });

    const result = parseCheckboxResult(ans);

    if (result === "back") return "back";
    if (result === "exit") return "exit";

    if (result.length === 0) {
      console.log(chalk.yellow(TERM_GUTTER + "请至少选择一个 Skill"));
      await new Promise(r => setTimeout(r, 1200));
      continue;
    }

    return result;
  }
}

// ── Step 2: Select tools (checkbox multi-select) ──
async function stepSelectTools(installedTools) {
  while (true) {
    await afterPromptFlush();
    printBanner();
    printSectionTitle("━━━ 选择目标工具 ━━━");

    const toolChoices = installedTools.map(t => ({
      name: t.name,
      value: t.id,
    }));

    const theme = {
      prefix: chalk.cyan(" ◆"),
      style: { highlight: (t) => chalk.cyan(t) },
    };

    // 第二步：底部为返回/退出功能行（移上后回车触发）
    const ans = await runCheckbox({
      message: "选择工具:",
      choices: withNavChoices(toolChoices, "↩ 返回上一步"),
      loop: false,
      theme,
    });

    const result = parseCheckboxResult(ans);

    if (result === "back") return "back";
    if (result === "exit") return "exit";

    if (result.length === 0) {
      console.log(chalk.yellow(TERM_GUTTER + "请至少选择一个工具"));
      await new Promise(r => setTimeout(r, 1200));
      continue;
    }

    return result;
  }
}

/**
 * 将步骤间传递的 id 列表规范为 string[]，避免竞态/异常路径传入非数组导致 .map 报错。
 * @param {unknown} v
 * @returns {string[]}
 */
function asIdArray(v) {
  if (!Array.isArray(v)) return [];
  return v.filter((x) => typeof x === "string");
}

// ── Step 3: Preview + Confirm（仅标题 + 确认菜单；不再展示 Skill/工具明细）──
async function stepPreviewConfirm(isUninstall) {
  await afterPromptFlush();
  printBanner();
  const actionLabel = isUninstall ? "卸载" : "安装";
  printSectionTitle("━━━ " + actionLabel + "预览 ━━━");
  // 第三步：标题下方不再打印 Skill/工具明细列表，由确认菜单直接操作

  const ans = await Select(
    {
      message: "确认" + actionLabel + "？",
      choices: [
        { name: "✓ 确认" + actionLabel, value: "confirm" },
        { name: "↩ 返回上一步", value: "back" },
        { name: "✕ 退出", value: "exit" },
      ],
      theme: { prefix: chalk.cyan(" ◆"), style: { highlight: (t) => chalk.cyan(t) } },
    },
    inquirerContext
  ).catch(() => "back");

  return ans;
}

// ── Step 4: Execute ──
async function stepExecute(skillIds, toolIds, installedTools, isUninstall) {
  const sids = asIdArray(skillIds);
  const tids = asIdArray(toolIds);
  await afterPromptFlush();
  printBanner();
  console.log();
  printSectionTitle("━━━ 执行中 ━━━");

  let allSuccess = true;

  for (const toolId of tids) {
    const tool = TOOLS.find(t => t.id === toolId);
    if (!tool) continue;

    for (const skillId of sids) {
      const skill = SKILLS.find(s => s.id === skillId);
      if (!skill) continue;

      const supported = skill.installTargets?.some(tgt => tgt.toolId === toolId);
      if (!supported) {
        console.log(chalk.gray(TERM_GUTTER + "- " + skill.name + "  ×  " + tool.name + " (不支持)"));
        continue;
      }

      if (isUninstall) {
        const result = uninstallSkillFromTool(skill, tool);
        if (result.success) {
          console.log(chalk.green(TERM_GUTTER + "✓ " + skill.name + " - " + tool.name));
        } else {
          console.log(chalk.yellow(TERM_GUTTER + "- " + skill.name + " - " + tool.name + " (未安装)"));
        }
      } else {
        const result = installSkillToTool(skill, tool);
        if (result.success) {
          console.log(chalk.green(TERM_GUTTER + "✓ " + skill.name + " → " + tool.name));
        } else {
          console.log(chalk.red(TERM_GUTTER + "✗ " + skill.name + " → " + tool.name + ": " + result.message));
          allSuccess = false;
        }
      }
    }
  }

  console.log();
  if (allSuccess) {
    console.log(chalk.green(TERM_GUTTER + "✅ 操作完成！\n"));
  } else {
    console.log(chalk.yellow(TERM_GUTTER + "⚠ 部分操作失败，请检查错误信息。\n"));
  }

  return allSuccess;
}

// ── Unified flow (install / uninstall) ──
async function runFlow(isUninstall) {
  const installedTools = detectInstalledTools().filter(t => t.installed);
  if (installedTools.length === 0) {
    await afterPromptFlush();
    printBanner();
    console.log(chalk.yellow(TERM_GUTTER + "⚠ 未检测到任何已安装的 AI 工具\n"));
    console.log(chalk.gray(TERM_GUTTER + "请先安装以下工具之一:\n"));
    TOOLS.forEach(t => {
      // 列表相对上一行再缩进一格 gutter，形成层级感
      console.log(TERM_GUTTER + TERM_GUTTER + chalk.cyan(t.name) + ": " + chalk.gray(t.installHint));
    });
    console.log();
    await input(
      {
        message: "按回车返回主菜单...",
        theme: { prefix: chalk.cyan(" ◆"), style: { highlight: (t) => chalk.cyan(t) } },
      },
      inquirerContext
    ).catch(() => {});
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
      const result = await stepPreviewConfirm(isUninstall);
      if (result === "back") { step = 2; continue; }
      if (result === "exit") return "exit";
      step = 4;
    } else if (step === 4) {
      let attempt = 0;
      let allSuccess = false;
      while (attempt < 3) {
        allSuccess = await stepExecute(selectedSkillIds, selectedToolIds, installedTools, isUninstall);
        if (allSuccess) break;
        attempt++;
        if (attempt < 3) {
          console.log(chalk.yellow(TERM_GUTTER + `第 ${attempt} 次重试...\n`));
        }
      }
      if (allSuccess) {
        await input(
          {
            message: "按任意键退出...",
            theme: { prefix: chalk.cyan(" ◆"), style: { highlight: (t) => chalk.cyan(t) } },
          },
          inquirerContext
        ).catch(() => {});
        return "exit";
      } else {
        console.log(chalk.red(TERM_GUTTER + "❌ 重试 3 次后仍有失败，请手动检查。\n"));
        await input(
          {
            message: "按任意键返回主菜单...",
            theme: { prefix: chalk.cyan(" ◆"), style: { highlight: (t) => chalk.cyan(t) } },
          },
          inquirerContext
        ).catch(() => {});
        return "back";
      }
    }
  }
}

// ── Main ──
export async function runInteractive() {
  let exit = false;

  while (!exit) {
    printBanner();

    const action = await Select(
      {
        message: "选择操作:",
        choices: [
          { name: padChoice(" 安装 Skill", 20), value: "install" },
          { name: padChoice(" 卸载 Skill", 20), value: "uninstall" },
          { name: padChoice(" 退出", 20), value: "exit" },
        ],
        theme: { prefix: chalk.cyan(" ◆"), style: { highlight: (t) => chalk.cyan(t) } },
      },
      inquirerContext
    ).catch(() => "exit");

    if (action === "exit") {
      break;
    }

    await afterPromptFlush();
    const result = await runFlow(action === "uninstall");

    if (result === "exit") {
      exit = true;
    }
    await afterPromptFlush();
    // "back" or "done" → loop continues, show main menu again
  }

  console.log(chalk.gray("\n" + TERM_GUTTER + "👋 Bye!\n"));
  process.exit(0);
}
