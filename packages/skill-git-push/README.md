# @ai-toolkit/skill-git-push

Code review + commit + push workflow for AI coding agents.

适配 OpenCode、Claude Code、Cursor、Trae 等 AI 编码编辑器。

## 安装

### 方式一：复制 SKILL.md 到编辑器

```bash
# Cursor
cp packages/skill-git-push/SKILL.md ~/.cursor/commands/git-push.md

# Claude Code
cp packages/skill-git-push/SKILL.md ~/.claude/commands/git-push.md
```

### 方式二：Hermes Agent Skill

```bash
git clone https://github.com/evenweiss/ai-toolkit.git
cd ai-toolkit
pnpm install
pnpm --filter @ai-toolkit/skill-git-push build
```

## 工作流

```
1. [调用 skill-identity]         ← 第一步：检测项目类型，设定身份
2. git status / git diff          ← Code Review
3. [调用 skill-git-commit]        ← 生成 commit message
4. git add → git commit → git push
```

## 工具函数

```typescript
import { gitPush } from '@ai-toolkit/skill-git-push';

const result = await gitPush({
  files: ['src/index.ts'],      // 可选：指定提交文件
  commitMessage: '...',          // 可选：直接指定提交信息（跳过 skill-git-commit）
});
```

## 依赖其他 skill

此 skill 作为 workflow，第一步调用 `skill-identity`，生成 commit message 时调用 `skill-git-commit`。

## 文件结构

```
skill-git-push/
├── SKILL.md            # 指令
├── src/
│   ├── index.ts        # 导出
│   └── tools/push.ts   # gitPush() 工具
├── package.json
└── README.md
```

## License

MIT
