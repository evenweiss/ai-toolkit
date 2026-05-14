import { existsSync, mkdirSync, copyFileSync, readdirSync, rmSync, unlinkSync } from "fs";
import { dirname, join } from "path";
import { getSkillSourcePath } from "./constants.js";

function ensureDir(filePath) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function copyFile(src, dest) {
  ensureDir(dest);
  copyFileSync(src, dest);
}

function copyDir(src, dest) {
  if (!existsSync(src)) throw new Error(`Source dir not found: ${src}`);
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }
  const entries = readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

/**
 * Install a skill to a specific tool destination.
 * @param {object} skill - skill object from constants.js
 * @param {object} tool - tool object from constants.js
 * @returns {{ success: boolean, message: string }}
 */
export function installSkillToTool(skill, tool) {
  // Look up the correct destPath from installTargets
  const target = skill.installTargets?.find(tgt => tgt.toolId === tool.id);
  if (!target) {
    return { success: false, message: `Skill does not support ${tool.name}` };
  }

  const sourceDir = getSkillSourcePath(skill.id);

  if (!existsSync(sourceDir)) {
    return { success: false, message: `Skill source not found: ${sourceDir}` };
  }

  const destPath = target.destPath();
  const destDir = dirname(destPath);

  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }

  const srcSkillFile = join(sourceDir, "SKILL.md");
  if (!existsSync(srcSkillFile)) {
    return { success: false, message: `SKILL.md not found in ${sourceDir}` };
  }

  const isDirBased = tool.installMode === "dir";

  if (isDirBased) {
    const destSkillDir = destPath;
    copyDir(sourceDir, destSkillDir);
    return { success: true, message: `Installed to ${destSkillDir}` };
  } else {
    copyFile(srcSkillFile, destPath);
    return { success: true, message: `Installed to ${destPath}` };
  }
}

/**
 * Uninstall a skill from a specific tool.
 */
export function uninstallSkillFromTool(skill, tool) {
  const target = skill.installTargets?.find(tgt => tgt.toolId === tool.id);
  if (!target) {
    return { success: false, message: `Skill does not support ${tool.name}` };
  }

  const destPath = target.destPath();
  const isDirBased = tool.installMode === "dir";

  if (isDirBased) {
    if (existsSync(destPath)) {
      rmSync(destPath, { recursive: true, force: true });
      return { success: true, message: `Uninstalled from ${destPath}` };
    } else {
      return { success: false, message: "Not installed" };
    }
  } else {
    if (existsSync(destPath)) {
      unlinkSync(destPath);
      return { success: true, message: `Uninstalled from ${destPath}` };
    } else {
      return { success: false, message: "Not installed" };
    }
  }
}
