/**
 * @ai-toolkit/skill-git-commit
 * Smart commit message generator
 */

export interface CommitSuggestion {
  type: string;
  scope?: string;
  subject: string;
  body: string;
}

export interface DiffFile {
  path: string;
  additions: number;
  deletions: number;
  changed: boolean;
}

// Skill content is in SKILL.md - read directly from file when needed
