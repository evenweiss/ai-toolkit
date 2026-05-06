# @ai-toolkit/skill-git-commit

Smart commit message generator with Conventional Commits format.

适配 OpenCode、Claude Code、Cursor、Trae 等 AI 编码编辑器。

## 安装

### 方式一：复制 SKILL.md 到编辑器

```bash
# Cursor
cp packages/skill-git-commit/SKILL.md ~/.cursor/commands/git-commit.md

# Claude Code
cp packages/skill-git-commit/SKILL.md ~/.claude/commands/git-commit.md
```

### 方式二：Hermes Agent Skill

```bash
git clone https://github.com/evenweiss/ai-toolkit.git
cd ai-toolkit
pnpm install
pnpm --filter @ai-toolkit/skill-git-commit build
```

## 功能

分析 `git diff` 输出，生成符合 Conventional Commits 规范的 commit message。

## 工具函数

```typescript
import { generateCommitMessage } from '@ai-toolkit/skill-git-commit';

// 输入：git diff 输出
const result = await generateCommitMessage(diffOutput);

// 输出：suggestions[] + files[] + rawDiff
```

## 输出示例

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

## 配合 skill-git-push

```
skill-git-commit（生成提交信息）→ skill-git-push（执行提交推送）
```

## 文件结构

```
skill-git-commit/
├── SKILL.md           # 指令
├── src/
│   ├── index.ts       # 导出
│   └── generate.ts    # generateCommitMessage() 工具
├── package.json
└── README.md
```

## License

MIT
