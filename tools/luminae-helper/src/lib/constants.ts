import { homedir } from "os";
import { join } from "path";

export interface Skill {
  id: string;           // directory name under skills/
  name: string;         // display name
  description: string;
  installTargets: InstallTarget[];  // which tools and how to install
}

export interface InstallTarget {
  toolId: string;
  destPath: () => string;  // absolute path to copy to (lazy eval)
}

export interface Tool {
  id: string;
  name: string;
  command: string;
  installMode: "file" | "dir";
  skillsDir: () => string;
  installHint?: string;
}

// Skills are auto-discovered at runtime via discoverSkills()
// from the skills/ directory. See constants.js for implementation.

export const TOOLS: Tool[] = [
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
  {
    id: "codex",
    name: "Codex",
    command: "codex",
    installMode: "dir",
    skillsDir: () => join(homedir(), ".codex", "skills"),
    installHint: "npm install -g @openai/codex",
  },
];

export const TOOL_MAP = Object.fromEntries(TOOLS.map((t) => [t.id, t]));
