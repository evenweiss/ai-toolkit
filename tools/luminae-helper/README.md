# luminae-helper

将 ai-toolkit 项目中的 skill 和 command 安装到本地 AI 编码工具的交互式 CLI。

> 双源发布：公开版（`luminae-helper`，npmjs.org）+ 孔夫子私服版（`kfz-skills-helper`，内网）。两个包功能一致，仅 skill 集合和 registry 不同。

## 功能

- **多选交互**：skill 和目标工具均支持 Checkbox 多选
- **自动检测**：通过 `which`/`where` 检测本机已安装的 AI 工具
- **导航支持**：每步均可返回上一步或退出
- **安装防护**：往 SKILL.md 注入 `managed-by: luminae-helper` 标识，卸载时校验，避免误删用户文件
- **失败重试**：安装失败自动重试 2 次；"不支持"等不可重试项单独汇总
- **原子替换**：dir 模式安装先拷到临时目录，再 rename 替换；失败可回滚

## 安装

```bash
# npmjs.org（公开版）
npm install -g luminae-helper

# 孔夫子内网（私服版，含 kongfz-jira/kongfz-wiki 等内部 skill）
npm install -g kfz-skills-helper --registry=http://maven.kongfz.com/repository/npm_local/
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

kfz-skills-helper 的命令完全独立：`kfz-skills-helper --version` / `kfz-skills-helper outdated`。两个包不共享 bin，可同时安装。

## 支持的 AI 工具

按 commands/ 和 skills/ 两种安装源路由，目标目录依据各工具官方支持：

| 工具 | 命令 | commandDir | skillDir |
|------|------|-----------|----------|
| Claude Code | `claude` | `~/.claude/commands/` | `~/.claude/skills/` |
| Codex | `codex` | — | `~/.codex/skills/` |
| Cursor | `cursor` | — | `~/.cursor/skills/` |
| Hermes Agent | `hermes` | — | `~/.hermes/skills/` |
| OpenCode | `opencode` | — | `~/.opencode/skills/` |
| Trae | `trae` | `~/.trae/commands/` | — |

## 安装规则

源目录决定优先安装方式，工具能力决定 fallback：

| skill 源 | 工具能力 | 安装方式 |
|---------|---------|---------|
| `commands/` | 支持 commandDir | file 模式：`commandDir/<id>.md` |
| `commands/` | 仅支持 skillDir | dir 模式（fallback）：`skillDir/<id>/` |
| `skills/` | 支持 skillDir | dir 模式：`skillDir/<id>/` |
| `skills/` | 仅支持 commandDir | file 模式（fallback）：`commandDir/<id>.md` |

例：Claude Code（双模式）→ `commands/identity` 装到 `~/.claude/commands/identity.md`；`skills/kongfz-jira` 装到 `~/.claude/skills/kongfz-jira/`。

## 操作流程

1. 主菜单：选择 **安装** 或 **卸载**
2. 多选 skill/command（空格切换勾选，回车确认）
3. 多选目标工具（仅显示本机已安装的）
4. 预览确认
5. 执行；失败时自动重试可重试项

任何步骤可用 Esc 返回上一步、Ctrl+C 退出。

## 添加新的 skill

1. 在仓库根目录（与 `tools/` 同级）的 `commands/<id>/` 或 `skills/<id>/` 下创建 SKILL.md
   - `commands/<id>/`：单文件命令型 skill，仅 SKILL.md 会被安装
   - `skills/<id>/`：目录型 skill，整个目录会被安装（除了 `node_modules`、`.git` 等）
2. SKILL.md 顶部用 YAML frontmatter 填 `name`/`description`（可选，缺省自动从 id 推导）
3. 在 `tools/luminae-helper` 下执行 `npm install` 或 `npm run sync-skills`，把根目录真源同步到包内
4. `discoverSkills()` 会自动扫描包内目录，无需手写注册

## 发布

```bash
# 同时发布到 npmjs.org 和孔夫子内网
npm run publish:all

# 仅其中之一
npm run publish:npmjs   # luminae-helper, 4 个公开 skill
npm run publish:kfz     # kfz-skills-helper, 全部 skill
```

profile 配置见 `publish/profiles.json`。`prepublishOnly` 以 `--strict` 同步真源，缺真源直接失败避免发空包。

## 变更日志

见 [CHANGELOG.md](./CHANGELOG.md)。
