# ai-toolkit

AI 编码 agent 技能仓库。给 Cursor、Claude Code、OpenCode、Trae 等 agent 用的可复用技能包。

## Skills

| Skill | 功能 | 依赖 |
|-------|------|------|
| skill-identity | 检测项目类型，设置 agent 身份 | 无 |
| skill-git-push | 完整 git 提交流程：身份→review→commit→push | skill-identity, skill-git-commit |
| skill-git-commit | 生成符合规范的 commit message | 无 |

## 安装

### 一键安装（推荐）

把以下任意一条指令丢给 AI 执行：

```markdown
安装 ai-toolkit skills（skill-identity、skill-git-push、skill-git-commit）到你的编辑器命令目录。
- 仓库：https://github.com/evenweiss/ai-toolkit
- 安装脚本：https://raw.githubusercontent.com/evenweiss/ai-toolkit/main/install.sh
- 用法：curl -sSL .../install.sh | bash [editor]
- editor 可选：cursor / claude / opencode / trae / all
```

或者直接终端执行：

```bash
# 安装到 Cursor
curl -sSL https://raw.githubusercontent.com/evenweiss/ai-toolkit/main/install.sh | bash

# 安装到 Claude Code
curl -sSL https://raw.githubusercontent.com/evenweiss/ai-toolkit/main/install.sh | bash claude

# 安装到所有编辑器
curl -sSL https://raw.githubusercontent.com/evenweiss/ai-toolkit/main/install.sh | bash all
```

### 手动安装

参考各 skill 目录下的 README.md。

## 开发

```bash
pnpm install
pnpm build
```
