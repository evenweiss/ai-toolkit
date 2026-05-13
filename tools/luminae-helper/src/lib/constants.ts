import { homedir } from "os";
import { join } from "path";

export interface Skill {
  id: string;           // directory name under skills/
  name: string;         // display name
  description: string;
  files: string[];      // files to copy (relative to skill dir)
  installTargets: InstallTarget[];  // which tools and how to install
}

export interface InstallTarget {
  toolId: string;
  destPath: string;     // absolute path to copy to
  isDir?: boolean;      // if true, copy entire directory
}

export interface Tool {
  id: string;
  name: string;
  command: string;
  configPath?: string;
  skillsDir?: string;    // for opencode which uses dir-based skills
  installHint?: string;
}

export const SKILLS: Skill[] = [
  {
    id: "skill-identity",
    name: "Identity",
    description: "检测项目类型，设置 agent 身份",
    files: ["SKILL.md"],
    installTargets: [
      {
        toolId: "claude-code",
        destPath: join(homedir(), ".claude", "commands", "identity.md"),
      },
      {
        toolId: "cursor",
        destPath: join(homedir(), ".cursor", "commands", "identity.md"),
      },
      {
        toolId: "trae",
        destPath: join(homedir(), ".trae", "commands", "identity.md"),
      },
    ],
  },
  {
    id: "skill-git-commit",
    name: "Git Commit",
    description: "智能生成符合规范的 commit message",
    files: ["SKILL.md"],
    installTargets: [
      {
        toolId: "claude-code",
        destPath: join(homedir(), ".claude", "commands", "git-commit.md"),
      },
      {
        toolId: "cursor",
        destPath: join(homedir(), ".cursor", "commands", "git-commit.md"),
      },
      {
        toolId: "trae",
        destPath: join(homedir(), ".trae", "commands", "git-commit.md"),
      },
    ],
  },
  {
    id: "skill-git-push",
    name: "Git Push",
    description: "推送代码并处理分支追踪",
    files: ["SKILL.md"],
    installTargets: [
      {
        toolId: "claude-code",
        destPath: join(homedir(), ".claude", "commands", "git-push.md"),
      },
      {
        toolId: "cursor",
        destPath: join(homedir(), ".cursor", "commands", "git-push.md"),
      },
      {
        toolId: "trae",
        destPath: join(homedir(), ".trae", "commands", "git-push.md"),
      },
    ],
  },
];

export const TOOLS: Tool[] = [
  {
    id: "claude-code",
    name: "Claude Code",
    command: "claude",
    configPath: join(homedir(), ".claude", "settings.json"),
    installHint: `npm install -g @anthropic-ai/claude-code`,
  },
  {
    id: "cursor",
    name: "Cursor",
    command: "cursor",
    configPath: join(homedir(), ".cursor", "settings.json"),
    installHint: `Download from https://cursor.com`,
  },
  {
    id: "opencode",
    name: "OpenCode",
    command: "opencode",
    skillsDir: join(homedir(), ".opencode", "skills"),
    installHint: `npm install -g opencode-ai`,
  },
  {
    id: "trae",
    name: "Trae",
    command: "trae",
    configPath: join(homedir(), ".trae", "settings.json"),
    installHint: `Download from https://trae.ai`,
  },
  {
    id: "openclaw",
    name: "OpenClaw",
    command: "openclaw",
    installHint: `npm install -g openclaw`,
  },
  {
    id: "nanobot",
    name: "Nanobot",
    command: "nanobot",
    installHint: `pip install nanobot`,
  },
  {
    id: "hermes-agent",
    name: "Hermes Agent",
    command: "hermes",
    installHint: `pip install hermes-ai`,
  },
  {
    id: "zeroclaw",
    name: "ZeroClaw",
    command: "zeroclaw",
    installHint: `npm install -g zeroclaw`,
  },
];

export const TOOL_MAP = Object.fromEntries(TOOLS.map((t) => [t.id, t]));
export const SKILL_MAP = Object.fromEntries(SKILLS.map((s) => [s.id, s]));
