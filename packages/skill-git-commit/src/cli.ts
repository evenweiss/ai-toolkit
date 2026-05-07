#!/usr/bin/env node
/**
 * skill-git-commit CLI
 * Usage: git diff | node dist/cli.js
 *        node dist/cli.js --diff <file>
 */

import { readFileSync } from 'fs';

interface DiffFile {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  additions: number;
  deletions: number;
}

interface CommitSuggestion {
  type: string;
  scope?: string;
  subject: string;
  body: string;
  reason: string;
}

interface GenerateResult {
  suggestions: CommitSuggestion[];
  files: DiffFile[];
  projectType: string;
}

function parseDiff(diff: string): { files: DiffFile[]; raw: string } {
  const files: DiffFile[] = [];
  let currentFile = '';
  let currentStatus: DiffFile['status'] = 'modified';
  let additions = 0;
  let deletions = 0;

  const lines = diff.split('\n');
  for (const line of lines) {
    if (line.startsWith('diff --git')) {
      if (currentFile) {
        files.push({ path: currentFile, status: currentStatus, additions, deletions });
      }
      const match = line.match(/b\/(.+)/);
      currentFile = match ? match[1] : '';
      currentStatus = 'modified';
      additions = 0;
      deletions = 0;
    } else if (line.startsWith('new file')) {
      currentStatus = 'added';
    } else if (line.startsWith('deleted file')) {
      currentStatus = 'deleted';
    } else if (line.startsWith('rename from')) {
      currentStatus = 'renamed';
    } else if (line.startsWith('+') && !line.startsWith('+++')) {
      additions++;
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      deletions++;
    }
  }
  if (currentFile) {
    files.push({ path: currentFile, status: currentStatus, additions, deletions });
  }

  return { files: files.length ? files : [{ path: 'unknown', status: 'modified', additions: 0, deletions: 0 }], raw: diff };
}

function extractScope(filePath: string): string {
  const parts = filePath.split('/');
  const srcIndex = parts.indexOf('src');
  if (srcIndex > 0) return parts[srcIndex - 1];
  if (parts.length >= 2) return parts[0];
  return 'none';
}

function detectProjectType(files: DiffFile[]): string {
  const hasReadme = files.some(f => f.path.toLowerCase().includes('readme'));
  const hasDocs = files.some(f => f.path.includes('docs/') || f.path.startsWith('docs/'));
  const hasTest = files.some(f => f.path.includes('test') || f.path.includes('spec') || f.path.includes('__tests__'));
  const hasConfig = files.some(f => {
    const p = f.path;
    return p.includes('config') || p.endsWith('.yml') || p.endsWith('.yaml') || p.endsWith('.json') || p === 'Makefile' || p === 'Dockerfile' || p === '.env';
  });
  const hasSrc = files.some(f => f.path.startsWith('src/') || f.path.startsWith('packages/'));
  const hasNew = files.some(f => f.status === 'added');
  const hasDel = files.some(f => f.status === 'deleted');
  const hasStyle = files.some(f => {
    const p = f.path;
    return p.endsWith('.css') || p.endsWith('.scss') || p.endsWith('.less') || p.endsWith('.styl');
  });
  const hasScript = files.some(f => {
    const p = f.path;
    return p.endsWith('.ts') || p.endsWith('.tsx') || p.endsWith('.js') || p.endsWith('.jsx') || p.endsWith('.py') || p.endsWith('.go') || p.endsWith('.java');
  });

  if (hasDel && !hasNew) return 'chore';
  if (hasReadme || hasDocs) return 'docs';
  if (hasTest && !hasSrc) return 'test';
  if (hasConfig) return 'chore';
  if (hasStyle) return 'style';
  if (hasScript) return 'feat';
  return 'feat';
}

function generateBody(files: DiffFile[], reason: string): string {
  const fileList = files.slice(0, 10).map(f => {
    const icon = f.status === 'added' ? '+' : f.status === 'deleted' ? '-' : '~';
    return `${icon} ${f.path} (+${f.additions}/-${f.deletions})`;
  }).join('\n');
  const more = files.length > 10 ? `\n... and ${files.length - 10} more files` : '';
  return `${reason}。\n\n变更文件：\n${fileList}${more}`;
}

function generateCommitMessage(files: DiffFile[], diff: string): GenerateResult {
  const hasNewFiles = files.some(f => f.status === 'added');
  const hasDeletedFiles = files.some(f => f.status === 'deleted');
  const hasTestFiles = files.some(f => f.path.includes('test') || f.path.includes('spec'));
  const hasDocsFiles = files.some(f => f.path.toLowerCase().includes('readme') || f.path.includes('docs/'));
  const hasConfigFiles = files.some(f => {
    const p = f.path;
    return p.includes('config') || p.endsWith('.yml') || p.endsWith('.yaml') || p.includes('.json') && !p.includes('package');
  });

  let type = detectProjectType(files);
  let reason = '';
  let subject = '';

  if (hasDeletedFiles && !hasNewFiles) {
    type = 'chore'; reason = '删除废弃代码'; subject = 'remove deprecated files';
  } else if (hasTestFiles && !hasNewFiles && !hasDeletedFiles) {
    type = 'test'; reason = '更新测试'; subject = 'update tests';
  } else if (hasDocsFiles) {
    type = 'docs'; reason = '更新文档'; subject = 'update documentation';
  } else if (hasConfigFiles) {
    type = 'chore'; reason = '更新配置'; subject = 'update configuration';
  } else if (type === 'feat') {
    reason = '实现新功能或优化'; subject = generateSubject(files);
  } else if (type === 'style') {
    reason = '代码格式或样式调整'; subject = 'update styles';
  }

  if (!reason) {
    reason = '项目更新'; subject = generateSubject(files);
  }

  const scope = extractScope(files[0]?.path || '');

  return {
    suggestions: [{
      type,
      scope: scope !== 'none' ? scope : undefined,
      subject,
      body: generateBody(files, reason),
      reason,
    }],
    files,
    projectType: type,
  };
}

function generateSubject(files: DiffFile[]): string {
  if (files.length === 0) return 'update';
  // Try to extract meaningful name from changed files
  const paths = files.map(f => f.path);
  // Find the most specific common path
  const first = paths[0];
  if (first.includes('/')) {
    const parts = first.split('/');
    // Prefer deeper paths (more specific)
    const deepest = paths.reduce((a, b) => (b.split('/').length > a.split('/').length ? b : a));
    const name = deepest.split('/').pop() || deepest;
    if (name && name.length > 2 && name.length < 40) return name.replace(/\.(ts|js|tsx|jsx|py|go|java)$/, '');
  }
  const name = first.split('/').pop() || 'update';
  return name.replace(/\.(ts|js|tsx|jsx|py|go|java)$/, '');
}

function main() {
  let diffInput = '';

  if (process.argv.includes('--diff')) {
    const idx = process.argv.indexOf('--diff');
    const filePath = process.argv[idx + 1];
    if (filePath) {
      diffInput = readFileSync(filePath, 'utf-8');
    }
  } else {
    // Read from stdin
    diffInput = require('fs').readFileSync('/dev/stdin', 'utf-8').trim();
  }

  if (!diffInput) {
    console.error('No diff input. Usage: git diff | node dist/cli.js');
    process.exit(1);
  }

  const { files } = parseDiff(diffInput);
  const result = generateCommitMessage(files, diffInput);

  // Format as conventional commit
  const sug = result.suggestions[0];
  const scope = sug.scope ? `(${sug.scope})` : '';
  const commitLine = `${sug.type}${scope}: ${sug.subject}`;

  console.log(JSON.stringify({
    commit: {
      full: `${commitLine}\n\n${sug.body}`,
      line: commitLine,
      body: sug.body,
      type: sug.type,
      scope: sug.scope,
      subject: sug.subject,
    },
    files: result.files,
    stats: {
      total: files.length,
      added: files.filter(f => f.status === 'added').length,
      modified: files.filter(f => f.status === 'modified').length,
      deleted: files.filter(f => f.status === 'deleted').length,
    }
  }, null, 2));
}

main();
