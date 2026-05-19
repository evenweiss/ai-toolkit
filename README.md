# ai-toolkit

AI 编码 agent 技能仓库。给 Cursor、Claude Code、OpenCode、Trae 等 agent 用的可复用技能包。

## Commands（单文件命令型）

| Command | 功能 |
|---------|------|
| identity | 检测项目类型，设置 agent 身份 |
| git-commit | 从 git diff 生成 commit message 并直接提交 |
| git-commit-msg | 从 git diff 生成 commit message（不自动提交） |
| git-push | 完整 git 提交流程：身份 → review → commit → push |

## Skills（目录型技能包）

| Skill | 功能 |
|-------|------|
| kongfz-wiki | 孔网 Wiki（wiki.kongfz.com，Confluence REST） |
| kongfz-jira | 孔网 Jira（jira.kongfz.com） |

## 安装

### Claude Code

```bash
mkdir -p ~/.claude/commands
cp <ai-toolkit目录>/commands/identity/SKILL.md ~/.claude/commands/identity.md
cp <ai-toolkit目录>/commands/git-commit/SKILL.md ~/.claude/commands/git-commit.md
cp <ai-toolkit目录>/commands/git-commit-msg/SKILL.md ~/.claude/commands/git-commit-msg.md
cp <ai-toolkit目录>/commands/git-push/SKILL.md ~/.claude/commands/git-push.md
cp <ai-toolkit目录>/skills/kongfz-wiki/SKILL.md ~/.claude/commands/kongfz-wiki.md
cp <ai-toolkit目录>/skills/kongfz-jira/SKILL.md ~/.claude/commands/kongfz-jira.md
```

### Cursor

```bash
mkdir -p ~/.cursor/commands
cp <ai-toolkit目录>/commands/identity/SKILL.md ~/.cursor/commands/identity.md
cp <ai-toolkit目录>/commands/git-commit/SKILL.md ~/.cursor/commands/git-commit.md
cp <ai-toolkit目录>/commands/git-commit-msg/SKILL.md ~/.cursor/commands/git-commit-msg.md
cp <ai-toolkit目录>/commands/git-push/SKILL.md ~/.cursor/commands/git-push.md
cp <ai-toolkit目录>/skills/kongfz-wiki/SKILL.md ~/.cursor/commands/kongfz-wiki.md
cp <ai-toolkit目录>/skills/kongfz-jira/SKILL.md ~/.cursor/commands/kongfz-jira.md
```

### OpenCode

```bash
mkdir -p ~/.opencode/skills
cp -r <ai-toolkit目录>/skills/* ~/.opencode/skills/
```

### Trae

```bash
mkdir -p ~/.trae/commands
cp <ai-toolkit目录>/commands/identity/SKILL.md ~/.trae/commands/identity.md
cp <ai-toolkit目录>/commands/git-commit/SKILL.md ~/.trae/commands/git-commit.md
cp <ai-toolkit目录>/commands/git-commit-msg/SKILL.md ~/.trae/commands/git-commit-msg.md
cp <ai-toolkit目录>/commands/git-push/SKILL.md ~/.trae/commands/git-push.md
cp <ai-toolkit目录>/skills/kongfz-wiki/SKILL.md ~/.trae/commands/kongfz-wiki.md
cp <ai-toolkit目录>/skills/kongfz-jira/SKILL.md ~/.trae/commands/kongfz-jira.md
```
