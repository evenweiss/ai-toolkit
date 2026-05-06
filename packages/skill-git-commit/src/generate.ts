/**
 * Generate commit message from git diff
 */

export interface DiffFile {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  additions: number;
  deletions: number;
}

export interface CommitSuggestion {
  type: string;
  scope?: string;
  subject: string;
  body: string;
  reason: string;
}

export interface GenerateResult {
  suggestions: CommitSuggestion[];
  files: DiffFile[];
  rawDiff: string;
}

/**
 * Analyze diff and generate commit message suggestions
 */
export async function generateCommitMessage(diffOutput: string): Promise<GenerateResult> {
  // Parse diff to extract changed files
  const files = parseDiff(diffOutput);

  // Analyze changes and determine commit type
  const suggestions = analyzeChanges(files, diffOutput);

  return {
    suggestions,
    files,
    rawDiff: diffOutput,
  };
}

function parseDiff(diff: string): DiffFile[] {
  const files: DiffFile[] = [];
  const fileRegex = /^(diff --git a\/(.+) b\/(.+)|new file mode|deleted file mode|@@.*@@)/gm;
  let currentFile = '';
  let currentStatus: DiffFile['status'] = 'modified';

  const lines = diff.split('\n');
  for (const line of lines) {
    if (line.startsWith('diff --git')) {
      const match = line.match(/b\/(.+)/);
      if (match) currentFile = match[1];
    } else if (line.startsWith('new file mode')) {
      currentStatus = 'added';
    } else if (line.startsWith('deleted file mode')) {
      currentStatus = 'deleted';
    } else if (line.startsWith('@@') && currentFile) {
      if (currentStatus === 'added') {
        files.push({ path: currentFile, status: 'added', additions: 0, deletions: 0 });
      } else if (currentStatus === 'deleted') {
        files.push({ path: currentFile, status: 'deleted', additions: 0, deletions: 0 });
      }
      currentStatus = 'modified';
      currentFile = '';
    }
  }

  // Default: treat as modified
  if (files.length === 0 && diff.trim()) {
    files.push({ path: 'unknown', status: 'modified', additions: 0, deletions: 0 });
  }

  return files;
}

function analyzeChanges(files: DiffFile[], diff: string): CommitSuggestion[] {
  const suggestions: CommitSuggestion[] = [];

  // Simple heuristics based on file paths and patterns
  const hasNewFiles = files.some(f => f.status === 'added');
  const hasDeletedFiles = files.some(f => f.status === 'deleted');
  const hasTestFiles = files.some(f => f.path.includes('test') || f.path.includes('spec'));
  const hasDocsFiles = files.some(f => f.path.includes('docs') || f.path.includes('README'));
  const hasConfigFiles = files.some(f =>
    f.path.includes('config') ||
    f.path.includes('.yml') ||
    f.path.includes('.json')
  );

  // Determine primary type
  let type = 'feat';
  let reason = '新功能';

  if (hasDeletedFiles && !hasNewFiles) {
    type = 'chore';
    reason = '删除废弃代码';
  } else if (hasTestFiles && !hasNewFiles && !hasDeletedFiles) {
    type = 'test';
    reason = '测试相关变更';
  } else if (hasDocsFiles) {
    type = 'docs';
    reason = '文档更新';
  } else if (hasConfigFiles) {
    type = 'chore';
    reason = '配置变更';
  }

  // Extract scope from first changed file
  const scope = extractScope(files[0]?.path || '');

  suggestions.push({
    type,
    scope,
    subject: generateSubject(files),
    body: generateBody(files, reason, diff),
    reason,
  });

  return suggestions;
}

function extractScope(filePath: string): string {
  const parts = filePath.split('/');
  if (parts.length >= 2) {
    // src/components/Button.ts -> components
    // packages/api/src/index.ts -> api
    const srcIndex = parts.indexOf('src');
    if (srcIndex > 0) return parts[srcIndex - 1];
    return parts[0];
  }
  return 'none';
}

function generateSubject(files: DiffFile[]): string {
  if (files.length === 0) return 'update';
  const firstFile = files[0].path.split('/').pop() || 'files';
  return `update ${firstFile}`;
}

function generateBody(files: DiffFile[], reason: string, _diff: string): string {
  const fileList = files.map(f => `- ${f.path}`).slice(0, 5).join('\n');
  const more = files.length > 5 ? `\n- ... and ${files.length - 5} more files` : '';
  return `${reason}。\n\n变更文件：\n${fileList}${more}`;
}
