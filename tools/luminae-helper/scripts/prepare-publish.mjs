#!/usr/bin/env node
/**
 * 按「发布 profile」生成独立发布目录（方案 A）。
 *
 * ## 做什么
 * 1. 在包根执行 `sync-skills.js --strict`，从 monorepo 根 `skills/` 拉取最新到包内 `skills/`。
 * 2. 按 profile 白名单过滤（或 `all` 全量），将 `src/`、`skills/`（子集）、`README.md` 拷到 `.publish/<profile>/`。
 * 3. 写入面向 npm 的 `package.json`：继承根配置，合并 `publishConfig`，并移除仅适用于源码仓库的 lifecycle（避免在 staging 里误跑 sync）。
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
 * 勿使用 `npm publish -C .publish/kfz`：在常见 npm 10+ 下 `-C` 仍可能按**父目录**的 package.json 发布，
 * 结果会落到 ~/.npmrc 的默认 registry（如 npm_internal），包名仍是 luminae-helper，与 profile 不一致。
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

/**
 * 读取并解析 profiles.json。
 * @returns {{ profiles: Record<string, { packageName?: string, publishConfig?: object, skills: string[] | "all" }> }}
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
 * 在包根执行 sync-skills，保证发布前 skills 与 monorepo 真源一致。
 */
function runSyncSkillsStrict() {
  const syncScript = join(packageRoot, "scripts", "sync-skills.js");
  execFileSync(process.execPath, [syncScript, "--strict"], {
    cwd: packageRoot,
    stdio: "inherit",
  });
}

/**
 * 扫描包内 `skills/` 下所有含 SKILL.md 的子目录名。
 * @returns {string[]}
 */
function discoverAllSkillIds() {
  const skillsRoot = join(packageRoot, "skills");
  if (!existsSync(skillsRoot)) return [];
  const ids = [];
  for (const name of readdirSync(skillsRoot)) {
    const p = join(skillsRoot, name);
    if (!statSync(p).isDirectory()) continue;
    if (existsSync(join(p, "SKILL.md"))) ids.push(name);
  }
  return ids.sort();
}

/**
 * 根据 profile 解析最终要打进 tarball 的 skill id 列表。
 * @param {{ skills: string[] | "all" }} profile
 * @param {string[]} allIds
 * @returns {string[]}
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
      `[prepare-publish] 以下 skill 在包内 skills/ 中不存在（请先 npm run sync-skills）：\n` +
        missing.map((m) => `  - ${m}`).join("\n")
    );
    process.exit(1);
  }
  return [...profile.skills];
}

/**
 * 递归拷贝目录。
 * @param {string} from
 * @param {string} to
 */
function copyDir(from, to) {
  cpSync(from, to, { recursive: true });
}

/**
 * 仅拷贝指定 skill 子目录到目标 skills 根下。
 * @param {string[]} skillIds
 * @param {string} destSkillsRoot
 */
function copySkillSubsets(skillIds, destSkillsRoot) {
  mkdirSync(destSkillsRoot, { recursive: true });
  const srcSkills = join(packageRoot, "skills");
  for (const id of skillIds) {
    const from = join(srcSkills, id);
    const to = join(destSkillsRoot, id);
    copyDir(from, to);
  }
}

/**
 * 从根包 `bin` 字段解析 CLI 入口脚本路径（字符串形式或对象形式取第一个路径）。
 * @param {string | Record<string, string> | undefined} baseBin
 * @returns {string}
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
 * 当发布包名与源码包名不同时，将 `bin` 的命令名改为与 `package.json#name` 一致（npm 全局命令来自 bin 的键名）。
 * @param {string | Record<string, string> | undefined} baseBin
 * @param {string} packageName
 * @returns {Record<string, string>}
 */
function binMatchingPackageName(baseBin, packageName) {
  return { [packageName]: resolveBinEntryPath(baseBin) };
}

/**
 * 基于根 package.json 生成「仅用于发布目录」的 manifest。
 * @param {object} basePkg
 * @param {{ packageName?: string, publishConfig?: object }} profile
 */
function buildPublishPackageJson(basePkg, profile) {
  /** 浅拷贝即可：我们会替换 scripts / files / publishConfig（及可选的 name） */
  const out = { ...basePkg };

  // 私服等场景可与 npmjs 使用不同包名，避免 registry 上名称冲突；未配置则沿用源码包名
  if (typeof profile.packageName === "string" && profile.packageName.trim()) {
    const pkgName = profile.packageName.trim();
    out.name = pkgName;
    // 全局/本地安装时，可执行文件名来自 bin 的键；与包名对齐，避免用户以为命令等于 name 却仍指向旧名
    out.bin = binMatchingPackageName(basePkg.bin, pkgName);
  }

  // 发布目录内不再执行 monorepo 同步（路径会错），只保留对终端用户无副作用的脚本
  out.scripts = {
    start: basePkg.scripts?.start ?? "node src/cli.js",
  };

  // 发布 tarball 不包含 sync-skills（已在打包时定型 skills/）
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
      "[prepare-publish] 包内 skills/ 为空。请确认 monorepo 根目录存在 skills/ 且 sync-skills 成功。"
    );
    process.exit(1);
  }

  const skillIds = resolveSkillIds(profile, allSkillIds);
  const staging = join(publishRoot, profileName);

  rmSync(staging, { recursive: true, force: true });
  mkdirSync(staging, { recursive: true });

  copyDir(join(packageRoot, "src"), join(staging, "src"));
  copySkillSubsets(skillIds, join(staging, "skills"));

  const readme = join(packageRoot, "README.md");
  if (existsSync(readme)) {
    cpSync(readme, join(staging, "README.md"));
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
