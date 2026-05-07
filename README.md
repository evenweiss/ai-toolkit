# ai-toolkit

AI 编码 agent 技能仓库。给 Cursor、Claude Code、OpenCode、Trae 等 agent 用的可复用技能包。

## Skills

| Skill | 功能 |
|-------|------|
| skill-identity | 检测项目类型，设置 agent 身份 |
| skill-git-push | 完整 git 提交流程：身份→review→commit→push |
| skill-git-commit | 生成符合规范的 commit message |

## 安装

把以下指令丢给 AI 执行：

```
克隆仓库 https://github.com/evenweiss/ai-toolkit
把每个 skill 的 SKILL.md 内容保存到你的编辑器命令目录中（AI 自动判断路径）。
skill-identity → identity.md
skill-git-push → git-push.md
skill-git-commit → git-commit.md
```

## CLI 工具（可直接调用）

```bash
# 克隆后构建
git clone https://github.com/evenweiss/ai-toolkit.git
cd ai-toolkit
pnpm install && pnpm build

# 检测身份
node packages/skill-identity/dist/cli.js

# 仅做 review
node packages/skill-git-push/dist/cli.js --review

# 完整流程
node packages/skill-git-push/dist/cli.js

# 生成 commit message
git diff | node packages/skill-git-commit/dist/cli.js
```
