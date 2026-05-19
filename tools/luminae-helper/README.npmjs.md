# luminae-helper

将 AI skill 安装到本地 AI 编码工具的交互式 CLI。

## 安装

```bash
npm install -g luminae-helper
```

## 使用

```bash
# 交互模式（默认）
luminae-helper

# 查看版本
luminae-helper --version
luminae-helper -v

# 检查是否有新版本
luminae-helper outdated
```

## 功能

- **多选交互**：skill 和目标工具均支持 Checkbox 多选
- **自动检测**：通过 `which`/`where` 检测本机已安装的 AI 工具
- **安装防护**：往 SKILL.md 注入 `managed-by: luminae-helper` 标识，卸载时校验，避免误删用户文件
- **失败重试**：安装失败自动重试 2 次；"不支持"等不可重试项单独汇总
- **原子替换**：dir 模式安装先拷到临时目录，再 rename 替换；失败可回滚

## 支持的 AI 工具

| 工具 | 命令 | commandDir | skillDir |
|------|------|-----------|----------|
| Claude Code | `claude` | `~/.claude/commands/` | `~/.claude/skills/` |
| Codex | `codex` | — | `~/.codex/skills/` |
| Cursor | `cursor` | — | `~/.cursor/skills/` |
| Hermes Agent | `hermes` | — | `~/.hermes/skills/` |
| OpenCode | `opencode` | — | `~/.opencode/skills/` |
| Trae | `trae` | `~/.trae/commands/` | — |

## 包含的 skill

本版本包含以下通用 skill：

- `identity` — 项目类型检测与 agent 身份设定
- `git-commit` — Git commit 流程
- `git-commit-msg` — Git commit message 生成
- `git-push` — Git push 流程

## 操作流程

1. 主菜单：选择 **安装** 或 **卸载**
2. 多选 skill/command（空格切换勾选，回车确认）
3. 多选目标工具（仅显示本机已安装的）
4. 预览确认
5. 执行；失败时自动重试可重试项

任何步骤可用 Esc 返回上一步、Ctrl+C 退出。

## 安装规则

源目录决定优先安装方式，工具能力决定 fallback：

| skill 源 | 工具能力 | 安装方式 |
|---------|---------|---------|
| `commands/` | 支持 commandDir | file 模式：`commandDir/<id>.md` |
| `commands/` | 仅支持 skillDir | dir 模式（fallback）：`skillDir/<id>/` |
| `skills/` | 支持 skillDir | dir 模式：`skillDir/<id>/` |
| `skills/` | 仅支持 commandDir | file 模式（fallback）：`commandDir/<id>.md` |

例：Claude Code（双模式）→ `commands/identity` 装到 `~/.claude/commands/identity.md`。

## 源码与变更

源码：https://github.com/evenweiss/ai-toolkit/tree/main/tools/luminae-helper

变更日志：[CHANGELOG.md](./CHANGELOG.md)

## License

MIT
