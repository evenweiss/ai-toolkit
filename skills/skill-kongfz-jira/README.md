# skill-kongfz-jira

Query and manage 孔网 Jira projects, issues, epics, and workflows via REST API.

## 触发条件

用户提到查询/创建/更新 Issue、Jira 搜索、Epic/Bug 统计、项目进度、Jira 链接时调用。

## 前置条件

需要配置 `JIRA_BEARER_TOKEN` 环境变量（孔网 Jira 个人访问令牌）。

获取方式：登录 jira.kongfz.com → 个人资料 → 个人访问令牌 → 创建令牌。

## 功能

1. **项目管理** — 获取项目列表/详情/版本/组件
2. **Issue CRUD** — 获取、创建、更新、删除 Issue（含子任务）
3. **JQL 搜索** — 灵活的查询语言，支持复杂条件
4. **工作流** — 查询和执行状态转换
5. **评论** — 增删改查评论
6. **附件** — 上传、查看、下载附件
7. **工时记录** — 查看和添加工时
8. **变更历史** — 查看 Issue 变更记录
9. **组件管理** — 创建、更新、删除项目组件
10. **用户查询** — 搜索用户、获取当前用户信息

## 安装

```bash
# Claude Code
cp skills/skill-kongfz-jira/SKILL.md ~/.claude/commands/kongfz-jira.md

# Cursor
cp skills/skill-kongfz-jira/SKILL.md ~/.cursor/commands/kongfz-jira.md

# OpenCode
cp -r skills/skill-kongfz-jira ~/.opencode/skills/

# Trae
cp skills/skill-kongfz-jira/SKILL.md ~/.trae/commands/kongfz-jira.md
```

## License

MIT
