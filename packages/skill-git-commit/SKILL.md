# skill-git-commit

> Generate commit message from git diff

**触发条件：** 当需要"生成提交信息"、"写 commit message"、"生成 commit"时调用。

## 工具

调用 `generateCommitMessage(diffOutput: string)` 函数：

- 输入：当前项目的 `git diff` 输出
- 输出：包含 `suggestions[]`、`files[]`、`rawDiff` 的结果

## 使用方式

```
1. 执行 git diff 获取变更内容
2. 调用 generateCommitMessage(diffOutput)
3. 从返回结果中获取 suggestions
4. 选择最合适的 suggestion 或组合多个
```

## 输出格式

```typescript
interface CommitSuggestion {
  type: string;      // feat / fix / docs / ...
  scope?: string;    // 模块名
  subject: string;   // 标题
  body: string;      // 中文描述
  reason: string;     // 判断依据
}

interface GenerateResult {
  suggestions: CommitSuggestion[];
  files: { path: string; status: string }[];
  rawDiff: string;
}
```

## 示例

**输入：** `git diff` 输出包含 `src/components/Button.ts` 的修改

**输出：**
```json
{
  "suggestions": [{
    "type": "feat",
    "scope": "components",
    "subject": "update Button",
    "body": "新功能。\n\n变更文件：\n- src/components/Button.ts",
    "reason": "新功能"
  }]
}
```

## Conventional Commits 格式

```
<type>(<scope>): <subject>

<body>
```
