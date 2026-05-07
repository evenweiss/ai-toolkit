#!/usr/bin/env node
/**
 * skill-git-push CLI
 * Full workflow: identity → review → commit → push
 * Usage: node dist/cli.js [--files <files>] [--message <msg>]
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

interface ReviewIssue {
  file: string;
  line?: number;
  problem: string;
  suggestion: string;
  severity: 'error' | 'warning';
}

interface ReviewResult {
  passed: boolean;
  projectType: string;
  identity: string;
  issues: ReviewIssue[];
  summary: string;
}

interface PushResult {
  success: boolean;
  review: ReviewResult;
  commitHash?: string;
  commitMessage?: string;
  pushOutput?: string;
  error?: string;
}

function exec(cmd: string, cwd?: string): string {
  try {
    return execSync(cmd, { encoding: 'utf-8', cwd: cwd || process.cwd(), stdio: ['pipe', 'pipe', 'pipe'] });
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string; status?: number };
    throw new Error(`Command failed: ${cmd}\n${err.stderr || err.stdout || ''}`);
  }
}

function getStatus(): string {
  return exec('git status --porcelain');
}

function getDiff(): string {
  return exec('git diff --no-color');
}

function detectIdentity(): { identity: string; projectType: string } {
  try {
    const rootDir = exec('git rev-parse --show-toplevel').trim();
    const identityCli = `${rootDir}/packages/skill-identity/dist/cli.js`;
    const result = exec(`node ${identityCli}`);
    const parsed = JSON.parse(result);
    return { identity: parsed.identity, projectType: parsed.projectType };
  } catch {
    return { identity: '高级软件工程师', projectType: 'unknown' };
  }
}

function reviewChanges(diff: string, projectType: string): ReviewResult {
  const issues: ReviewIssue[] = [];

  if (!diff.trim()) {
    return { passed: true, projectType, identity: '', issues: [], summary: '没有未提交的更改' };
  }

  const lines = diff.split('\n');
  let currentFile = '';

  for (const line of lines) {
    if (line.startsWith('diff --git')) {
      const match = line.match(/b\/(.+)/);
      currentFile = match ? match[1] : '';
    } else if (line.startsWith('+') && !line.startsWith('+++')) {
      const content = line.slice(1);
      if (content.includes('console.log') && !currentFile.includes('.test.')) {
        issues.push({ file: currentFile, problem: '包含 console.log 调试代码', suggestion: '删除 console.log', severity: 'warning' });
      }
      if (content.includes('TODO') || content.includes('FIXME')) {
        issues.push({ file: currentFile, problem: `包含未完成标记: ${content.trim().slice(0, 40)}`, suggestion: '完成或创建 issue 跟踪', severity: 'warning' });
      }
    if (/password\s*=\s*['"][^'"]|secret\s*=\s*['"][^'"]|api[_-]?key\s*=\s*['"][^'"]|token\s*=\s*['"][^'"]|bearer\s+[a-zA-Z0-9_-]{20,}/i.test(content) && !currentFile.includes('.test.') && !currentFile.endsWith('.md')) {
      issues.push({ file: currentFile, problem: '可能包含敏感信息硬编码', suggestion: '使用环境变量', severity: 'error' });
    }
    }
  }

  const passed = !issues.some(i => i.severity === 'error');
  const addedLines = (diff.match(/^\+[^+].*/gm) || []).length;
  const deletedLines = (diff.match(/^-[^-].*/gm) || []).length;

  return {
    passed,
    projectType,
    identity: '',
    issues,
    summary: passed
      ? `Review 通过。检测到 ${addedLines} 行新增，${deletedLines} 行删除。`
      : `Review 不通过。发现 ${issues.length} 个问题（${issues.filter(i => i.severity === 'error').length} 个错误，${issues.filter(i => i.severity === 'warning').length} 个警告）。`,
  };
}

function generateCommitMessage(diff: string): string {
  try {
    const rootDir = exec('git rev-parse --show-toplevel').trim();
    const commitCli = `${rootDir}/packages/skill-git-commit/dist/cli.js`;
    const diffFile = `/tmp/ai-toolkit-commit-diff-${Date.now()}.txt`;
    readFileSync('/dev/null'); // ensure fs is used
    require('fs').writeFileSync(diffFile, diff);
    const result = exec(`node ${commitCli} --diff ${diffFile}`);
    const parsed = JSON.parse(result);
    return parsed.commit.full;
  } catch {
    return 'chore: update files';
  }
}

function gitPush(message?: string): PushResult {
  const status = getStatus();
  if (!status.trim()) {
    return {
      success: false,
      review: { passed: true, projectType: '', identity: '', issues: [], summary: 'Nothing to commit' },
      error: '没有未提交的更改',
    };
  }

  const diff = getDiff();
  const { identity, projectType } = detectIdentity();
  const review = reviewChanges(diff, projectType);

  if (!review.passed) {
    return { success: false, review, error: 'Review 不通过，请先解决上述问题' };
  }

  const commitMessage = message || generateCommitMessage(diff);

  try {
    exec('git add -A');
    const hash = exec("git log -1 --format='%H'").trim();
    try {
      exec(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`);
    } catch (e: unknown) {
      const err = e as { message?: string };
      return { success: false, review, error: `提交失败: ${err.message}` };
    }
    let pushOutput = '';
    try {
      pushOutput = exec('git push');
    } catch (e: unknown) {
      const err = e as { message?: string };
      return { success: false, review, commitHash: hash, commitMessage, error: `推送失败: ${err.message}` };
    }
    return { success: true, review, commitHash: hash, commitMessage, pushOutput: pushOutput.trim() };
  } catch (e: unknown) {
    const err = e as { message?: string };
    return { success: false, review, error: err.message };
  }
}

function main() {
  if (process.argv.includes('--review')) {
    const diff = getDiff();
    const { projectType } = detectIdentity();
    const review = reviewChanges(diff, projectType);
    console.log(JSON.stringify(review, null, 2));
    return;
  }

  const message = process.argv.includes('--message')
    ? process.argv[process.argv.indexOf('--message') + 1]
    : undefined;

  const result = gitPush(message);
  console.log(JSON.stringify(result, null, 2));
}

main();
