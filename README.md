# ai-toolkit

AI 编码 agent 技能仓库。给 Cursor、Claude Code、OpenCode、Trae 等 agent 用的可复用技能包。

## Skills

| Skill | 功能 |
|-------|------|
| skill-identity | 检测项目类型，设置 agent 身份 |
| skill-git-commit | 从 git diff 生成符合 Conventional Commits 规范的 commit message |
| skill-git-push | 完整 git 提交流程：身份 → review → commit → push |

## 安装

### Claude Code

```bash
mkdir -p ~/.claude/commands
cp <ai-toolkit目录>/skills/skill-identity/SKILL.md ~/.claude/commands/identity.md
cp <ai-toolkit目录>/skills/skill-git-commit/SKILL.md ~/.claude/commands/git-commit.md
cp <ai-toolkit目录>/skills/skill-git-push/SKILL.md ~/.claude/commands/git-push.md
```

### Cursor

```bash
mkdir -p ~/.cursor/commands
cp <ai-toolkit目录>/skills/skill-identity/SKILL.md ~/.cursor/commands/identity.md
cp <ai-toolkit目录>/skills/skill-git-commit/SKILL.md ~/.cursor/commands/git-commit.md
cp <ai-toolkit目录>/skills/skill-git-push/SKILL.md ~/.cursor/commands/git-push.md
```

### OpenCode

```bash
mkdir -p ~/.opencode/skills
cp -r <ai-toolkit目录>/skills/* ~/.opencode/skills/
```

### Trae

```bash
mkdir -p ~/.trae/commands
cp <ai-toolkit目录>/skills/skill-identity/SKILL.md ~/.trae/commands/identity.md
cp <ai-toolkit目录>/skills/skill-git-commit/SKILL.md ~/.trae/commands/git-commit.md
cp <ai-toolkit目录>/skills/skill-git-push/SKILL.md ~/.trae/commands/git-push.md
```
