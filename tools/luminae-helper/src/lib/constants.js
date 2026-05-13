import { homedir } from "os";
import { join } from "path";
import { commandExists } from "../utils/platform.js";

export const SKILLS = [
  {
    id: "skill-identity",
    name: "Identity",
    description: "检测项目类型，设置 agent 身份",
    installTargets: [
      {
        toolId: "claude-code",
        destPath: () => join(homedir(), ".claude", "commands", "identity.md"),
      },
      {
        toolId: "cursor",
        destPath: () => join(homedir(), ".cursor", "commands", "identity.md"),
      },
      {
        toolId: "trae",
        destPath: () => join(homedir(), ".trae", "commands", "identity.md"),
      },
      {
        toolId: "opencode",
        destPath: () => join(homedir(), ".opencode", "skills", "skill-identity"),
      },
    ],
  },
  {
    id: "skill-git-commit",
    name: "Git Commit",
    description: "智能生成符合规范的 commit message",
    installTargets: [
      {
        toolId: "claude-code",
        destPath: () => join(homedir(), ".claude", "commands", "git-commit.md"),
      },
      {
        toolId: "cursor",
        destPath: () => join(homedir(), ".cursor", "commands", "git-commit.md"),
      },
      {
        toolId: "trae",
        destPath: () => join(homedir(), ".trae", "commands", "git-commit.md"),
      },
      {
        toolId: "opencode",
        destPath: () => join(homedir(), ".opencode", "skills", "skill-git-commit"),
      },
    ],
  },
  {
    id: "skill-git-push",
    name: "Git Push",
    description: "推送代码并处理分支追踪",
    installTargets: [
      {
        toolId: "claude-code",
        destPath: () => join(homedir(), ".claude", "commands", "git-push.md"),
      },
      {
        toolId: "cursor",
        destPath: () => join(homedir(), ".cursor", "commands", "git-push.md"),
      },
      {
        toolId: "trae",
        destPath: () => join(homedir(), ".trae", "commands", "git-push.md"),
      },
      {
        toolId: "opencode",
        destPath: () => join(homedir(), ".opencode", "skills", "skill-git-push"),
      },
    ],
  },
];

export const TOOLS = [
  {
    id: "claude-code",
    name: "Claude Code",
    command: "claude",
    skillsDir: () => join(homedir(), ".claude", "commands"),
    installHint: "npm install -g @anthropic-ai/claude-code",
  },
  {
    id: "cursor",
    name: "Cursor",
    command: "cursor",
    skillsDir: () => join(homedir(), ".cursor", "commands"),
    installHint: "Download from https://cursor.com",
  },
  {
    id: "opencode",
    name: "OpenCode",
    command: "opencode",
    skillsDir: () => join(homedir(), ".opencode", "skills"),
    installHint: "npm install -g opencode-ai",
  },
  {
    id: "trae",
    name: "Trae",
    command: "trae",
    skillsDir: () => join(homedir(), ".trae", "commands"),
    installHint: "Download from https://trae.ai",
  },
  {
    id: "openclaw",
    name: "OpenClaw",
    command: "openclaw",
    skillsDir: () => join(homedir(), ".openclaw", "skills"),
    installHint: "npm install -g openclaw",
  },
  {
    id: "nanobot",
    name: "Nanobot",
    command: "nanobot",
    skillsDir: () => join(homedir(), ".nanobot", "skills"),
    installHint: "pip install nanobot",
  },
  {
    id: "hermes-agent",
    name: "Hermes Agent",
    command: "hermes",
    skillsDir: () => join(homedir(), ".hermes", "skills"),
    installHint: "pip install hermes-ai",
  },
  {
    id: "zeroclaw",
    name: "ZeroClaw",
    command: "zeroclaw",
    skillsDir: () => join(homedir(), ".zeroclaw", "skills"),
    installHint: "npm install -g zeroclaw",
  },
];

/**
 * Detect which tools are installed on this machine.
 * Returns array of tool objects with extra `installed: true` field.
 */
export function detectInstalledTools() {
  return TOOLS.map((tool) => ({
    ...tool,
    installed: commandExists(tool.command),
  }));
}

/**
 * Find skill source directory from the ai-toolkit project.
 * import.meta.dirname = <luminae-helper>/src/lib  (when imported by cli.js or -e)
 * Normalize path: luminae-helperDir/src/lib -> luminae-helperDir -> tools -> project root
 */
export function getSkillSourcePath(skillId) {
  const selfDir = import.meta.dirname;
  let skillInstallerDir = selfDir;
  if (selfDir.endsWith("/src/lib") || selfDir.endsWith("\\src\\lib")) {
    skillInstallerDir = join(selfDir, "..", "..");
  } else if (selfDir.endsWith("/src") || selfDir.endsWith("\\src")) {
    skillInstallerDir = join(selfDir, "..");
  }
  // skillInstallerDir -> tools -> project root (go up 2 more levels from skillInstallerDir)
  const projectRoot = join(skillInstallerDir, "..", "..");
  return join(projectRoot, "skills", skillId);
}
