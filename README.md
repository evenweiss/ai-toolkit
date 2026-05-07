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
cd ai-toolkit
pnpm install && pnpm build
```

## CLI 调用

克隆构建后，用绝对路径调用：

```bash
# 检测身份
node <克隆目录>/packages/skill-identity/dist/cli.js

# 生成 commit message
git diff | node <克隆目录>/packages/skill-git-commit/dist/cli.js

# 仅做 review
node <克隆目录>/packages/skill-git-push/dist/cli.js --review

# 完整流程
node <克隆目录>/packages/skill-git-push/dist/cli.js
```
