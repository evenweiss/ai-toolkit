/**
 * @ai-toolkit/skill-git-push
 * Code review + commit + push workflow for AI coding agents
 */

export interface ReviewResult {
  passed: boolean;
  issues?: Array<{
    file: string;
    line?: number;
    problem: string;
    suggestion: string;
  }>;
}

export interface CommitResult {
  hash?: string;
  message?: string;
  pushed?: boolean;
  error?: string;
}

export interface GitPushWorkflow {
  projectType: string;
  identity: string;
  review: ReviewResult;
  commit?: CommitResult;
}

// Skill content is in skill.md - read directly from file when needed
