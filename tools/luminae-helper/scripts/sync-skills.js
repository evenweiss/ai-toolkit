#!/usr/bin/env node
/**
 * 将 monorepo 根目录下的 `commands/` 和 `skills/` 同步到本包内。
 *
 * ## 背景
 * - 仓库中 command/skill 的唯一真源为 `<ai-toolkit>/commands/` 和 `<ai-toolkit>/skills/`。
 * - 目录结构为 `commands/<skillId>/SKILL.md` 和 `skills/<skillId>/SKILL.md`。
 * - `luminae-helper` 运行时通过包内 `commands/` 和 `skills/` 发现内容；npm 发布物
 *   也只能包含包根下的文件，不能依赖包外路径。
 * - 因此：Git 只跟踪根目录真源；包内目录由本脚本在适当时机生成。
 *
 * ## 调用场景
 * - `npm run sync-skills`：手动同步（开发调试用）。
 * - `prepare`（`npm install` 时）：若在 monorepo 中能解析到根目录真源，
 *   则同步到包内；若不能（例如用户从 npm 安装了已发布的包），且包内已有内容，
 *   则**跳过**，避免误删已发布内容。
 * - `prepublishOnly`（`npm publish` 前）：使用 `--strict`，必须找到有效真源
 *   并完成复制，否则退出码 1，防止发布空包。
 *
 * ## 参数
 * - `--strict`：强制要求至少一个真源目录存在且包含有效的 skill。
 */

import { cpSync, existsSync, readdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";

/** 同步时跳过的目录名，与 installer.js COPY_SKIP_ENTRIES 保持一致 */
const SYNC_SKIP_ENTRIES = new Set(["node_modules", ".git", ".DS_Store", "Thumbs.db"]);

/** 是否处于发布前严格模式（由 npm 脚本传入 `--strict`） */
const strict = process.argv.includes("--strict");

/** 本脚本所在目录：`tools/luminae-helper/scripts/` */
const scriptDir = import.meta.dirname;
/** `luminae-helper` 包根目录 */
const packageRoot = join(scriptDir, "..");
/** 仓库根目录 */
const repoRoot = join(packageRoot, "..", "..");

/** 需要同步的目录名及其在仓库根和包内的路径 */
const SYNC_DIRS = [
  {
    name: "commands",
    repoDir: join(repoRoot, "commands"),
    destDir: join(packageRoot, "commands"),
  },
  {
    name: "skills",
    repoDir: join(repoRoot, "skills"),
    destDir: join(packageRoot, "skills"),
  },
];

/**
 * 判断某目录下是否至少存在一个「子目录 + 其内 SKILL.md」的 skill 结构。
 * @param {string} root - 待扫描的路径
 * @returns {boolean}
 */
function hasSkillTree(root) {
  if (!existsSync(root)) return false;
  try {
    if (!statSync(root).isDirectory()) return false;
    for (const name of readdirSync(root)) {
      const child = join(root, name);
      if (!statSync(child).isDirectory()) continue;
      if (existsSync(join(child, "SKILL.md"))) return true;
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * 用根目录真源覆盖包内对应目录（先删后拷，保证与真源一致）。
 * 跳过 node_modules、.git 等不必要的条目。
 */
function syncDir(repoDir, destDir) {
  rmSync(destDir, { recursive: true, force: true });
  cpSync(repoDir, destDir, {
    recursive: true,
    filter: (src) => {
      const name = src.split(/[/\\]/).pop();
      return !SYNC_SKIP_ENTRIES.has(name);
    },
  });
}

function main() {
  const results = SYNC_DIRS.map(({ name, repoDir, destDir }) => {
    const repoReady = hasSkillTree(repoDir);
    return { name, repoDir, destDir, repoReady };
  });

  const anyRepoReady = results.some(r => r.repoReady);

  if (anyRepoReady) {
    for (const { name, repoDir, destDir, repoReady } of results) {
      if (repoReady) {
        syncDir(repoDir, destDir);
        console.log(`[sync-skills] 已同步 ${name}: ${repoDir} -> ${destDir}`);
      } else {
        // 真源不存在时，保留包内已有内容，仅当包内也无有效内容时清理
        if (hasSkillTree(destDir)) {
          console.log(`[sync-skills] 跳过 ${name}: 无真源 ${repoDir}，包内已有有效内容`);
        } else if (existsSync(destDir)) {
          rmSync(destDir, { recursive: true, force: true });
          console.log(`[sync-skills] 跳过 ${name}: 无真源 ${repoDir}，清理包内空目录`);
        } else {
          console.log(`[sync-skills] 跳过 ${name}: 无真源 ${repoDir}`);
        }
      }
    }
    return;
  }

  if (strict) {
    console.error(
      `[sync-skills] --strict: 未找到任何可用的真源目录\n` +
        results.map(r => `  - ${r.repoDir}`).join("\n") +
        "\n请在包含 commands/ 或 skills/ 的 ai-toolkit 仓库根上下文下执行 npm publish。"
    );
    process.exit(1);
  }

  const anyPkgReady = results.some(r => hasSkillTree(r.destDir));
  if (anyPkgReady) {
    console.log(
      `[sync-skills] 跳过：无真源，且包内已有有效内容。`
    );
    return;
  }

  console.warn(
    `[sync-skills] 警告：既无真源，包内也无有效内容。\n` +
      "在 monorepo 中开发请保留仓库根目录 commands/ 和 skills/，并执行 npm install 或 npm run sync-skills。"
  );
}

main();
