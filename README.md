# AI Toolkit

AI tools plugins for agentic coding (OpenCode, Claude Code, Cursor, Trae, etc.)

## Skills

| Skill | Description |
|-------|-------------|
| [skill-identity](packages/skill-identity/) | Detect project type and set agent identity — foundation for all tasks |
| [skill-git-push](packages/skill-git-push/) | Code review + commit + push workflow |
| [skill-git-commit](packages/skill-git-commit/) | Generate commit message from git diff |
| [plugin-example](packages/plugin-example/) | Example plugin template |

## 安装所有 Skill

### 方式一：复制所有 SKILL.md 到编辑器

```bash
# Clone 仓库
git clone https://github.com/evenweiss/ai-toolkit.git
cd ai-toolkit

# Cursor - 安装所有 skill
cp packages/skill-identity/SKILL.md ~/.cursor/commands/identity.md
cp packages/skill-git-push/SKILL.md ~/.cursor/commands/git-push.md
cp packages/skill-git-commit/SKILL.md ~/.cursor/commands/git-commit.md

# Claude Code - 安装所有 skill
cp packages/skill-identity/SKILL.md ~/.claude/commands/identity.md
cp packages/skill-git-push/SKILL.md ~/.claude/commands/git-push.md
cp packages/skill-git-commit/SKILL.md ~/.claude/commands/git-commit.md
```

### 方式二：作为 npm 包使用

```bash
git clone https://github.com/evenweiss/ai-toolkit.git
cd ai-toolkit
pnpm install
pnpm -r build
```

然后在代码中引用：

```typescript
import { detectIdentity } from '@ai-toolkit/skill-identity';
import { generateCommitMessage } from '@ai-toolkit/skill-git-commit';
import { gitPush } from '@ai-toolkit/skill-git-push';
```

## 开发

```bash
# 安装依赖
pnpm install

# 构建所有包
pnpm -r build

# 构建指定包
pnpm --filter @ai-toolkit/skill-identity build
pnpm --filter @ai-toolkit/skill-git-commit build
pnpm --filter @ai-toolkit/skill-git-push build
```
