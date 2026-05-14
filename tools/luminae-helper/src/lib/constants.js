import { homedir } from "os";
import { join } from "path";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { commandExists } from "../utils/platform.js";

// ── Tools ──

export const TOOLS = [
  {
    id: "claude-code",
    name: "Claude Code",
    command: "claude",
    installMode: "file",
    skillsDir: () => join(homedir(), ".claude", "commands"),
    installHint: "npm install -g @anthropic-ai/claude-code",
  },
  {
    id: "cursor",
    name: "Cursor",
    command: "cursor",
    installMode: "file",
    skillsDir: () => join(homedir(), ".cursor", "commands"),
    installHint: "Download from https://cursor.com",
  },
  {
    id: "opencode",
    name: "OpenCode",
    command: "opencode",
    installMode: "dir",
    skillsDir: () => join(homedir(), ".opencode", "skills"),
    installHint: "npm install -g opencode-ai",
  },
  {
    id: "trae",
    name: "Trae",
    command: "trae",
    installMode: "file",
    skillsDir: () => join(homedir(), ".trae", "commands"),
    installHint: "Download from https://trae.ai",
  },
  {
    id: "openclaw",
    name: "OpenClaw",
    command: "openclaw",
    installMode: "dir",
    skillsDir: () => join(homedir(), ".openclaw", "skills"),
    installHint: "npm install -g openclaw",
  },
  {
    id: "nanobot",
    name: "Nanobot",
    command: "nanobot",
    installMode: "dir",
    skillsDir: () => join(homedir(), ".nanobot", "skills"),
    installHint: "pip install nanobot",
  },
  {
    id: "hermes-agent",
    name: "Hermes Agent",
    command: "hermes",
    installMode: "dir",
    skillsDir: () => join(homedir(), ".hermes", "skills"),
    installHint: "pip install hermes-ai",
  },
  {
    id: "zeroclaw",
    name: "ZeroClaw",
    command: "zeroclaw",
    installMode: "dir",
    skillsDir: () => join(homedir(), ".zeroclaw", "skills"),
    installHint: "npm install -g zeroclaw",
  },
];

// ── Skill auto-discovery ──

/**
 * Get the package root directory.
 * import.meta.dirname = <luminae-helper>/src/lib
 * Package root = <luminae-helper>/
 */
function getPackageDir() {
  const selfDir = import.meta.dirname;
  if (selfDir.endsWith("/src/lib") || selfDir.endsWith("\\src\\lib")) {
    return join(selfDir, "..", "..");
  }
  if (selfDir.endsWith("/src") || selfDir.endsWith("\\src")) {
    return join(selfDir, "..");
  }
  return selfDir;
}

/**
 * Parse YAML frontmatter from SKILL.md content.
 * Only extracts `name` and `description`.
 */
function parseSkillMeta(skillId, content) {
  let name = null;
  let description = null;

  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (fmMatch) {
    for (const line of fmMatch[1].split("\n")) {
      const m = line.match(/^(\w+):\s*(.+)/);
      if (m) {
        if (m[1] === "name") name = m[2].trim();
        if (m[1] === "description") description = m[2].trim();
      }
    }
  }

  // Default name: skillId without "skill-" prefix, capitalize words
  if (!name) {
    name = skillId
      .replace(/^skill-/, "")
      .replace(/(^|-)(\w)/g, (_, p, c) => (p === "-" ? " " : "") + c.toUpperCase());
  }

  // Default description: first blockquote line
  if (!description) {
    const bq = content.match(/^>\s*(.+)/m);
    if (bq) description = bq[1].trim();
  }

  return { name, description };
}

/**
 * Generate destPath for a skill+tool combo based on installMode.
 * - file mode: <skillsDir>/<shortName>.md
 * - dir mode:  <skillsDir>/<skillId>/
 */
function generateDestPath(tool, skillId) {
  const shortName = skillId.replace(/^skill-/, "");
  if (tool.installMode === "dir") {
    return () => join(tool.skillsDir(), skillId);
  }
  return () => join(tool.skillsDir(), `${shortName}.md`);
}

/**
 * Scan skills/ directory and build SKILLS array automatically.
 * Each subdirectory containing a SKILL.md is a valid skill.
 */
export function discoverSkills() {
  const skillsRoot = join(getPackageDir(), "skills");
  if (!existsSync(skillsRoot)) return [];

  const skills = [];
  for (const entry of readdirSync(skillsRoot)) {
    const skillPath = join(skillsRoot, entry);
    if (!statSync(skillPath).isDirectory()) continue;

    const skillFile = join(skillPath, "SKILL.md");
    if (!existsSync(skillFile)) continue;

    const skillId = entry;
    const content = readFileSync(skillFile, "utf-8");
    const { name, description } = parseSkillMeta(skillId, content);

    skills.push({
      id: skillId,
      name,
      description,
      installTargets: TOOLS.map((tool) => ({
        toolId: tool.id,
        destPath: generateDestPath(tool, skillId),
      })),
    });
  }

  return skills;
}

export const SKILLS = discoverSkills();

// ── Helpers ──

/**
 * Detect which tools are installed on this machine.
 */
export function detectInstalledTools() {
  return TOOLS.map((tool) => ({
    ...tool,
    installed: commandExists(tool.command),
  }));
}

/**
 * Find skill source directory bundled inside this package.
 * Skills are at <luminae-helper>/skills/<skillId>/
 */
export function getSkillSourcePath(skillId) {
  return join(getPackageDir(), "skills", skillId);
}
