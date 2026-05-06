# @ai-toolkit/skill-git-push

Code review + commit + push workflow for AI coding agents.

适配 OpenCode、Claude Code、Cursor、Trae 等 AI 编码编辑器。

## 安装

### 方式一：复制 SKILL.md 到编辑器（推荐）

```bash
# Cursor
cp SKILL.md ~/.cursor/commands/git-push.md

# Claude Code
cp SKILL.md ~/.claude/commands/git-push.md
```

### 方式二：Hermes Agent Skill

```bash
git clone https://github.com/evenweiss/ai-toolkit.git
cd ai-toolkit
pnpm install
pnpm --filter @ai-toolkit/skill-git-push build
```

## 文件结构

```
skill-git-push/
├── SKILL.md       # 紧凑 header（注入 context 用）
├── WORKFLOW.md    # 详细流程文档（按需加载）
├── package.json
└── src/
    ├── index.ts         # 导出类型和接口
    └── tools/
        ├── review.ts    # gitReview 工具定义
        └── commit.ts    # gitCommit 工具定义
```

## 工作流

```
审查未提交代码 → 生成提交信息 → 执行 git commit → 执行 git push
```

## 核心规则

1. **先 review，后提交** — 发现 bug/逻辑问题只提方案，不修复，不提交，不推送
2. **中文正文** — 提交信息 body 使用中文描述
3. **Conventional Commits** — 格式：`<type>(<scope>): <subject>`

## 配合 skill-git-commit

```
skill-git-commit（生成提交信息）→ skill-git-push（执行提交推送）
```

## License

MIT
