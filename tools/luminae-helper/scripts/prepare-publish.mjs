#!/usr/bin/env node
/**
 * 按「发布 profile」生成独立发布目录。
 *
 * ## 做什么
 * 1. 在包根执行 `sync-skills.js --strict`，从 monorepo 真源拉取最新到包内。
 * 2. 按 profile 白名单过滤（或 `all` 全量），将 `src/`、`commands/`、`skills/`（子集）、
 *    `README.md` 拷到 `.publish/<profile>/`。
 * 3. 写入面向 npm 的 `package.json`：继承根配置，合并 `publishConfig`，并移除仅适用于源码仓库的 lifecycle。
 *
 * ## 用法
 *   node scripts/prepare-publish.mjs <profile>
 * 例如：
 *   node scripts/prepare-publish.mjs npmjs
 *   node scripts/prepare-publish.mjs kfz
 *
 * ## 与 npm publish 的配合
 * 生成完成后在包根 `tools/luminae-helper` 下执行，**必须把暂存目录作为路径参数**：
 *   npm publish ./.publish/npmjs
 *   npm publish ./.publish/kfz
 * 也可使用 package.json 里封装的 `npm run publish:npmjs` / `publish:kfz` / `publish:all`（双源）。
 */

import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

/** 本脚本目录：`tools/luminae-helper/scripts/` */
const scriptDir = import.meta.dirname;
/** luminae-helper 包根 */
const packageRoot = join(scriptDir, "..");
/** profile 配置路径 */
const profilesPath = join(packageRoot, "publish", "profiles.json");
/** 发布物输出根：gitignore 忽略 */
const publishRoot = join(packageRoot, ".publish");

/** 包内需要扫描的 skill 目录 */
const SKILL_DIRS = ["commands", "skills"];

/**
 * 读取并解析 profiles.json。
 */
function loadProfiles() {
  if (!existsSync(profilesPath)) {
    console.error(`[prepare-publish] 缺少配置文件: ${profilesPath}`);
    process.exit(1);
  }
  const raw = readFileSync(profilesPath, "utf-8");
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("[prepare-publish] profiles.json 解析失败:", e);
    process.exit(1);
  }
}

/**
 * 在包根执行 sync-skills，保证发布前内容与 monorepo 真源一致。
 */
function runSyncSkillsStrict() {
  const syncScript = join(packageRoot, "scripts", "sync-skills.js");
  execFileSync(process.execPath, [syncScript, "--strict"], {
    cwd: packageRoot,
    stdio: "inherit",
  });
}

/**
 * 扫描包内 commands/ 和 skills/ 下所有含 SKILL.md 的子目录名。
 * @returns {string[]}
 */
function discoverAllSkillIds() {
  const ids = [];
  for (const typeDir of SKILL_DIRS) {
    const typePath = join(packageRoot, typeDir);
    if (!existsSync(typePath)) continue;
    for (const name of readdirSync(typePath)) {
      const p = join(typePath, name);
      if (!statSync(p).isDirectory()) continue;
      if (existsSync(join(p, "SKILL.md"))) ids.push(name);
    }
  }
  return ids.sort();
}

/**
 * 根据 profile 解析最终要打进 tarball 的 skill id 列表。
 */
function resolveSkillIds(profile, allIds) {
  if (profile.skills === "all") {
    return [...allIds];
  }
  if (!Array.isArray(profile.skills)) {
    console.error(
      '[prepare-publish] profile.skills 必须是 "all" 或 string[]（skill 目录名）'
    );
    process.exit(1);
  }
  const missing = profile.skills.filter((id) => !allIds.includes(id));
  if (missing.length) {
    console.error(
      `[prepare-publish] 以下 skill 在包内不存在（请先 npm run sync-skills）：\n` +
        missing.map((m) => `  - ${m}`).join("\n")
    );
    process.exit(1);
  }
  return [...profile.skills];
}

/** 同步时跳过的目录名，与 installer.js COPY_SKIP_ENTRIES 保持一致 */
const COPY_SKIP_ENTRIES = new Set(["node_modules", ".git", ".DS_Store", "Thumbs.db"]);

/**
 * 递归拷贝目录，跳过 node_modules、.git 等不必要的条目。
 */
function copyDir(from, to) {
  cpSync(from, to, {
    recursive: true,
    filter: (src) => {
      const name = src.split(/[/\\]/).pop();
      return !COPY_SKIP_ENTRIES.has(name);
    },
  });
}

/**
 * 查找 skill 所在的目录（commands/ 或 skills/）。
 * @param {string} skillId
 * @returns {string|null} "commands" or "skills"
 */
function findSkillTypeDir(skillId) {
  for (const typeDir of SKILL_DIRS) {
    const skillPath = join(packageRoot, typeDir, skillId);
    if (existsSync(skillPath) && statSync(skillPath).isDirectory()) {
      return typeDir;
    }
  }
  return null;
}

/**
 * 仅拷贝指定 skill 子目录到目标根下（保持 commands/skills 目录结构）。
 * @param {string[]} skillIds
 * @param {string} destRoot - 发布暂存根目录
 */
function copySkillSubsets(skillIds, destRoot) {
  for (const id of skillIds) {
    const typeDir = findSkillTypeDir(id);
    if (!typeDir) continue;
    const from = join(packageRoot, typeDir, id);
    const to = join(destRoot, typeDir, id);
    mkdirSync(to, { recursive: true });
    copyDir(from, to);
  }
}

/**
 * 从根包 `bin` 字段解析 CLI 入口脚本路径。
 */
function resolveBinEntryPath(baseBin) {
  if (typeof baseBin === "string" && baseBin.trim()) {
    return baseBin.trim();
  }
  if (baseBin && typeof baseBin === "object") {
    for (const v of Object.values(baseBin)) {
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  return "src/cli.js";
}

/**
 * 当发布包名与源码包名不同时，将 `bin` 的命令名改为与 `package.json#name` 一致。
 */
function binMatchingPackageName(baseBin, packageName) {
  return { [packageName]: resolveBinEntryPath(baseBin) };
}

/**
 * 基于根 package.json 生成「仅用于发布目录」的 manifest。
 */
function buildPublishPackageJson(basePkg, profile) {
  const out = { ...basePkg };

  if (typeof profile.packageName === "string" && profile.packageName.trim()) {
    const pkgName = profile.packageName.trim();
    out.name = pkgName;
    out.bin = binMatchingPackageName(basePkg.bin, pkgName);
  }

  out.scripts = {
    start: basePkg.scripts?.start ?? "node src/cli.js",
  };

  const files = Array.isArray(basePkg.files) ? [...basePkg.files] : [];
  out.files = files.filter((f) => f !== "scripts/sync-skills.js");

  if (profile.publishConfig && typeof profile.publishConfig === "object") {
    out.publishConfig = { ...profile.publishConfig };
  }

  return out;
}

function main() {
  const profileName = process.argv[2];
  if (!profileName) {
    console.error(
      "用法: node scripts/prepare-publish.mjs <profile>\n" +
        "可用 profile 见 publish/profiles.json 的 profiles 键（如 npmjs、kfz）。"
    );
    process.exit(1);
  }

  const { profiles } = loadProfiles();
  const profile = profiles[profileName];
  if (!profile) {
    console.error(`[prepare-publish] 未知 profile: ${profileName}`);
    process.exit(1);
  }

  runSyncSkillsStrict();

  const allSkillIds = discoverAllSkillIds();
  if (allSkillIds.length === 0) {
    console.error(
      "[prepare-publish] 包内无任何 skill。请确认 monorepo 根目录存在 commands/ 或 skills/ 且 sync-skills 成功。"
    );
    process.exit(1);
  }

  const skillIds = resolveSkillIds(profile, allSkillIds);
  const staging = join(publishRoot, profileName);

  rmSync(staging, { recursive: true, force: true });
  mkdirSync(staging, { recursive: true });

  copyDir(join(packageRoot, "src"), join(staging, "src"));
  copySkillSubsets(skillIds, staging);

  // README：优先使用 profile 专属（README.<profile>.md），缺则 fallback 到 README.md
  const profileReadme = join(packageRoot, `README.${profileName}.md`);
  const defaultReadme = join(packageRoot, "README.md");
  const readmeSrc = existsSync(profileReadme) ? profileReadme : defaultReadme;
  if (existsSync(readmeSrc)) {
    cpSync(readmeSrc, join(staging, "README.md"));
    console.log(`[prepare-publish] README: ${readmeSrc}`);
  }

  // CHANGELOG 也一起拷过去（如果存在），方便包页面看版本变更
  const changelog = join(packageRoot, "CHANGELOG.md");
  if (existsSync(changelog)) {
    cpSync(changelog, join(staging, "CHANGELOG.md"));
  }

  const basePkg = JSON.parse(
    readFileSync(join(packageRoot, "package.json"), "utf-8")
  );
  const outPkg = buildPublishPackageJson(basePkg, profile);
  writeFileSync(
    join(staging, "package.json"),
    `${JSON.stringify(outPkg, null, 2)}\n`,
    "utf-8"
  );

  console.log(
    `[prepare-publish] 已生成: ${staging}\n` +
      `  profile: ${profileName}\n` +
      `  package name: ${outPkg.name}\n` +
      `  skills (${skillIds.length}): ${skillIds.join(", ")}\n` +
      `  publishConfig.registry: ${outPkg.publishConfig?.registry ?? "(未设置)"}`
  );
}

main();
