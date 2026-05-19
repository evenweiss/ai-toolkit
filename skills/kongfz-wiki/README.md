# kongfz-wiki

Read and write 孔网 Wiki pages (wiki.kongfz.com) via REST API.

## 触发条件

用户分享 Wiki 页面链接、或要求读取/搜索/创建/更新 Wiki 页面时调用。

## 前置条件

需要配置 `CONFLUENCE_BEARER_TOKEN` 环境变量（Wiki 后端为 Confluence 兼容 API 时使用的个人访问令牌）。

获取方式：登录 wiki.kongfz.com → 个人资料 → 个人访问令牌 → 创建令牌。

## 功能

1. **读取页面** — 通过 pageId 获取页面内容
2. **搜索页面** — 按关键词搜索
3. **创建页面** — 在指定空间或父页面下创建新页面
4. **更新页面** — 更新已有页面内容（自动处理版本号）

## 安装

```bash
# Claude Code
cp skills/kongfz-wiki/SKILL.md ~/.claude/commands/kongfz-wiki.md

# Cursor
cp skills/kongfz-wiki/SKILL.md ~/.cursor/commands/kongfz-wiki.md

# OpenCode
cp -r skills/kongfz-wiki ~/.opencode/skills/

# Trae
cp skills/kongfz-wiki/SKILL.md ~/.trae/commands/kongfz-wiki.md
```

## License

MIT
