#!/usr/bin/env node
/**
 * 将 monorepo 根目录下的 `skills/` 同步到本包内的 `skills/`。
 *
 * ## 背景
 * - 仓库中 Skill 的**唯一真源**为 `<ai-toolkit>/skills/`（与 `tools/` 同级）。
 * - `luminae-helper` 运行时通过 `getPackageDir()/skills` 发现 Skill；npm 发布物
 *   也只能包含包根下的文件，不能把 tarball 依赖到包外的 `../../skills`。
 * - 因此：Git 只跟踪根目录真源；包内目录由本脚本在适当时机生成。
 *
 * ## 调用场景
 * - `npm run sync-skills`：手动同步（开发调试用）。
 * - `prepare`（`npm install` 时）：若在 monorepo 中能解析到根目录 `skills/`，
 *   则同步到包内；若不能（例如用户从 npm 安装了已发布的包），且包内已有
 *   `skills/`（来自发布 tarball），则**跳过**，避免误删已发布内容。
 * - `prepublishOnly`（`npm publish` 前）：使用 `--strict`，必须在 monorepo 中
 *   找到有效根目录 `skills/` 并完成复制，否则退出码 1，防止发布空包。
 *
 * ## 参数
 * - `--strict`：强制要求根目录 `skills/` 存在且至少包含一个含 `SKILL.md` 的子目录。
 */

import { cpSync, existsSync, readdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";

/** 是否处于发布前严格模式（由 npm 脚本传入 `--strict`） */
const strict = process.argv.includes("--strict");

/** 本脚本所在目录：`tools/luminae-helper/scripts/` */
const scriptDir = import.meta.dirname;
/** `luminae-helper` 包根目录 */
const packageRoot = join(scriptDir, "..");
/** 仓库根目录下的 skills：`<repo>/skills` */
const repoSkillsRoot = join(packageRoot, "..", "..", "skills");
/** 包内供 CLI 读取的路径：`<luminae-helper>/skills` */
const destSkillsRoot = join(packageRoot, "skills");

/**
 * 判断某目录下是否至少存在一个「子目录 + 其内 SKILL.md」的 skill 结构。
 * @param {string} root - 待扫描的 skills 根路径
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
 * 用根目录真源覆盖包内 `skills/`（先删后拷，保证与真源一致）。
 */
function syncFromRepo() {
  rmSync(destSkillsRoot, { recursive: true, force: true });
  cpSync(repoSkillsRoot, destSkillsRoot, { recursive: true });
}

function main() {
  const repoReady = hasSkillTree(repoSkillsRoot);

  if (repoReady) {
    syncFromRepo();
    console.log(`[sync-skills] 已同步: ${repoSkillsRoot} -> ${destSkillsRoot}`);
    return;
  }

  if (strict) {
    console.error(
      `[sync-skills] --strict: 未找到可用的 monorepo skill 源: ${repoSkillsRoot}\n` +
        "请在包含 `skills/` 的 ai-toolkit 仓库根上下文下执行 npm publish。"
    );
    process.exit(1);
  }

  if (hasSkillTree(destSkillsRoot)) {
    console.log(
      `[sync-skills] 跳过：无 ${repoSkillsRoot}，且包内 ${destSkillsRoot} 已存在。`
    );
    return;
  }

  console.warn(
    `[sync-skills] 警告：既无 ${repoSkillsRoot}，包内也无有效 ${destSkillsRoot}。\n` +
      "在 monorepo 中开发请保留仓库根目录 `skills/`，并执行 npm install 或 npm run sync-skills。"
  );
}

main();
