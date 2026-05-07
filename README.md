# ai-toolkit

AI 编码 agent 技能仓库。给 Cursor、Claude Code、OpenCode、Trae 等 agent 用的可复用技能包。

## Skills

| Skill | 功能 | CLI |
|-------|------|-----|
| skill-identity | 检测项目类型，设置 agent 身份 | `node skill-identity/dist/cli.js` |
| skill-git-push | 完整 git 提交流程 | `node skill-git-push/dist/cli.js` |
| skill-git-commit | 生成符合规范的 commit message | `git diff \| node skill-git-commit/dist/cli.js` |

## 安装

### 方式一：install.sh（推荐）

```bash
curl -sSL https://raw.githubusercontent.com/evenweiss/ai-toolkit/main/install.sh | bash [editor]
```

editor 可选：`cursor` / `claude` / `opencode` / `trae` / `all`

### 方式二：克隆后本地安装

```bash
git clone https://github.com/evenweiss/ai-toolkit.git
cd ai-toolkit
pnpm install
pnpm build    # 构建所有 CLI 工具
```

CLI 位于各包 `dist/cli.js`，直接用 node 调用。

## 使用方式

把 SKILL.md 作为命令 prompt 丢给 AI，或直接调用 CLI 工具：

```bash
# 检测身份
node packages/skill-identity/dist/cli.js

# 仅做 code review
node packages/skill-git-push/dist/cli.js --review

# 完整流程：review + commit + push
node packages/skill-git-push/dist/cli.js

# 生成 commit message
git diff | node packages/skill-git-commit/dist/cli.js
```

## 开发

```bash
pnpm install
pnpm build
```
