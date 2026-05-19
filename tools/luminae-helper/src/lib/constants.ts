import { homedir } from "os";
import { join } from "path";

export type SkillType = "command" | "skill";

export interface Skill {
  id: string;           // directory name under commands/ or skills/
  name: string;         // display name
  description: string;
  type: SkillType;      // "command" = single .md, "skill" = multi-file directory
  installTargets: InstallTarget[];
}

export interface InstallTarget {
  toolId: string;
  installMode: "file" | "dir";
  destPath: () => string;  // absolute path to copy to (lazy eval)
}

export interface Tool {
  id: string;
  name: string;
  command: string;
  commandDir: (() => string) | null;  // tools that support commands (e.g. ~/.claude/commands)
  skillDir: (() => string) | null;    // tools that support skills (e.g. ~/.opencode/skills)
  installHint?: string;
}

// Skills are auto-discovered at runtime via discoverSkills()
// from commands/ and skills/ directories. See constants.js for implementation.

export const TOOLS: Tool[] = [
  {
    id: "claude-code",
    name: "Claude Code",
    command: "claude",
    commandDir: () => join(homedir(), ".claude", "commands"),
    skillDir: null,
    installHint: "npm install -g @anthropic-ai/claude-code",
  },
  {
    id: "cursor",
    name: "Cursor",
    command: "cursor",
    commandDir: () => join(homedir(), ".cursor", "commands"),
    skillDir: null,
    installHint: "Download from https://cursor.com",
  },
  {
    id: "opencode",
    name: "OpenCode",
    command: "opencode",
    commandDir: null,
    skillDir: () => join(homedir(), ".opencode", "skills"),
    installHint: "npm install -g opencode-ai",
  },
  {
    id: "trae",
    name: "Trae",
    command: "trae",
    commandDir: () => join(homedir(), ".trae", "commands"),
    skillDir: null,
    installHint: "Download from https://trae.ai",
  },
  {
    id: "openclaw",
    name: "OpenClaw",
    command: "openclaw",
    commandDir: null,
    skillDir: () => join(homedir(), ".openclaw", "skills"),
    installHint: "npm install -g openclaw",
  },
  {
    id: "nanobot",
    name: "Nanobot",
    command: "nanobot",
    commandDir: null,
    skillDir: () => join(homedir(), ".nanobot", "skills"),
    installHint: "pip install nanobot",
  },
  {
    id: "hermes-agent",
    name: "Hermes Agent",
    command: "hermes",
    commandDir: null,
    skillDir: () => join(homedir(), ".hermes", "skills"),
    installHint: "pip install hermes-ai",
  },
  {
    id: "zeroclaw",
    name: "ZeroClaw",
    command: "zeroclaw",
    commandDir: null,
    skillDir: () => join(homedir(), ".zeroclaw", "skills"),
    installHint: "npm install -g zeroclaw",
  },
  {
    id: "codex",
    name: "Codex",
    command: "codex",
    commandDir: () => join(homedir(), ".codex", "commands"),
    skillDir: () => join(homedir(), ".codex", "skills"),
    installHint: "npm install -g @openai/codex",
  },
];

export const TOOL_MAP = Object.fromEntries(TOOLS.map((t) => [t.id, t]));
