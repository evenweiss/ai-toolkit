# Changelog

按版本汇总主要变更。完整提交记录见 git 历史。

## 0.0.9 — 2026-05-19

- 双源发布支持 profile 专属 README（`README.npmjs.md` / `README.kfz.md`），各自包页面只显示对应版本的信息
- 发布产物附带 `CHANGELOG.md`

## 0.0.8 — 2026-05-19

- 新增 `--version` / `-v` 命令，输出当前包名@版本号
- 新增 `outdated` 命令，查询对应 registry（npmjs / kfz 内网）检查是否有新版本
- `luminae-helper` 和 `kfz-skills-helper` 各自独立的 bin，互不影响

## 0.0.7 — 2026-05-19

- **新增 `managed-by` 标识机制**：安装时往 SKILL.md frontmatter 注入 `managed-by: luminae-helper`，卸载时校验，防止误删用户文件或 AI 工具自带的同名 skill
- **重新设计安装路由**：按源目录（`commands/` vs `skills/`）决定优先安装方式，工具能力决定 fallback
- **修正各工具支持情况**（按官方文档）：
  - Claude Code 新增 skillDir（`~/.claude/skills/`）
  - Cursor 移除 commandDir，仅保留 skillDir
  - 移除 Nanobot、OpenClaw、ZeroClaw 支持（无官方文档证实 skills 目录）
- skill 目录结构从 `skill-<id>/` 前缀改为 `commands/<id>/` + `skills/<id>/` 双源
- TOOLS 列表按名称字母排序
- 多项稳定性修复：
  - copyDir 改为先备份旧目录、临时目录原子替换、失败可回滚
  - copyDir/sync-skills/prepare-publish 统一过滤 `node_modules`/`.git` 等
  - commandExists 增加 spawnSync 异常捕获
  - parseSkillMeta 支持剥离 YAML 行尾注释和引号
  - 重试成功后仍有不可重试失败项时显式提示用户

## 0.0.6 — 2026-05

- skillId `kongfz-wiki` / `kongfz-jira` 重命名（去掉 `confluence-` 前缀）
- 修复 TUI 多选叠屏渲染问题
- 统一 CLI 终端缩进和文案

## 0.0.5 — 2026-05

- 新增 Codex 工具支持
- 新增 skill-git-commit-msg
- 修正部分失败提示样式
- 修复多选竞态下 `toolIds.map` 崩溃

## 0.0.4 — 2026-05

- 支持双 registry 发布（npmjs.org + 孔夫子内网）
- `kfz-skills-helper` 在私服下独立包名 + 独立 bin
- 新增 `publish:all` 串联发布
- 失败自动重试 3 次

## 0.0.3 — 2026-05

- 首个对外发布版本
- 包名定为 `luminae-helper`
- skill 自动发现（扫描包内 `skills/`）
- 移除 confluence-wiki，整合到孔夫子 skill 中

## 0.0.1 — 0.0.2

- 初始 CLI 工具，支持安装/卸载 skill 到 AI 编码工具
