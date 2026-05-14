# luminae-helper

AI Skill 安装器 — 将 ai-toolkit 项目中的 skill 安装到本地 AI 编码工具。

## 功能

- **多选交互**：Skill 和目标工具均支持 Checkbox 多选
- **自动检测**：自动检测本机已安装的 AI 工具
- **导航支持**：每个步骤均支持返回上一步和退出
  - Checkbox 步骤：Esc 返回上一步，Ctrl+C 退出
  - 预览确认步骤：显式选项（确认/返回/退出）
- **安装/卸载**：支持安装和卸载操作

## 支持的工具

| 工具 | 命令 | Skill 安装方式 |
|------|------|---------------|
| Claude Code | `claude` | `~/.claude/commands/<skill>.md` |
| Cursor | `cursor` | `~/.cursor/commands/<skill>.md` |
| OpenCode | `opencode` | `~/.opencode/skills/<skill>/` (目录) |
| Trae | `trae` | `~/.trae/commands/<skill>.md` |
| OpenClaw | `openclaw` | `~/.openclaw/skills/<skill>/` (目录) |
| Nanobot | `nanobot` | `~/.nanobot/skills/<skill>/` (目录) |
| Hermes Agent | `hermes` | `~/.hermes/skills/<skill>/` (目录) |
| ZeroClaw | `zeroclaw` | `~/.zeroclaw/skills/<skill>/` (目录) |

## 安装

```bash
# 进入工具目录
cd tools/luminae-helper

# 安装依赖
npm install

# 链接到全局（可选）
npm link
```

## 使用

```bash
# 直接运行
node src/cli.js

# 或链接后
luminae-helper
```

## 操作流程

1. 选择 **安装** 或 **卸载**
2. 多选 Skill（Checkbox，空格切换，回车确认）
3. 多选目标工具（Checkbox，仅显示已安装的工具）
4. 预览确认（确认 / 返回上一步 / 退出）
5. 执行

每一步都支持返回上一步和退出：
- Checkbox 步骤：列表底部显示导航项（灰显，不可勾选），Esc 返回上一步，Ctrl+C 退出
- 确认步骤：显式选择「返回上一步」或「退出」

## 添加新的 Skill

1. 在 **仓库根目录**（与 `tools/` 同级）创建 `skills/skill-your-skill/SKILL.md`（及可选 `README.md` 等）。此处为 Git 中的**唯一真源**。
2. 在 `tools/luminae-helper` 下执行 `npm install` 或 `npm run sync-skills`，会把根目录 `skills/` 同步到本包内的 `skills/`（该目录已 `.gitignore`，勿在包内手改副本）。
3. Skill 元数据与安装目标由 `src/lib/constants.js` 的 `discoverSkills()` 自动扫描包内 `skills/` 生成，一般无需再手写 `SKILLS` 数组。

## 发布 npm 包

`prepublishOnly` 会在发布前以 `--strict` 运行同步：必须在 monorepo 中能找到根目录 `skills/`，否则发布失败，避免打出不含 Skill 的空包。
