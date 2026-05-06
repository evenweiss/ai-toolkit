# @ai-toolkit/skill-git-commit

Smart commit message generator with Conventional Commits format.

适配 OpenCode、Claude Code、Cursor、Trae 等 AI 编码编辑器。

## 安装

### 方式一：复制 SKILL.md 到编辑器（推荐）

```bash
# Cursor
cp SKILL.md ~/.cursor/commands/git-commit.md

# Claude Code
cp SKILL.md ~/.claude/commands/git-commit.md
```

### 方式二：Hermes Agent Skill

```bash
git clone https://github.com/evenweiss/ai-toolkit.git
cd ai-toolkit
pnpm install
pnpm --filter @ai-toolkit/skill-git-commit build
```

## 工作流

```
分析 git diff → 判断 type → 生成 subject → 生成 body
```

## 核心规则

1. **先分析 diff** — 理解变更内容
2. **判断 type** — feat / fix / docs / style / refactor 等
3. **生成 subject** — ≤50字，祈使句
4. **生成 body** — 中文描述变更背景、原因和关键实现

## 格式

```
<type>(<scope>): <subject>

<body>
```

## 配合 skill-git-push

```
skill-git-commit（生成提交信息）→ skill-git-push（执行提交推送）
```

## License

MIT
