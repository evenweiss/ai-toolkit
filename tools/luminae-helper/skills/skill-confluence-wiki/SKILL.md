---
name: Confluence Wiki
description: 读写公司 Confluence Wiki 页面
---

# skill-confluence-wiki

> Read and write pages on company Confluence Wiki (wiki.kongfz.com) via REST API

**触发条件：** 用户分享 Confluence 页面链接、要求读取/搜索/创建/更新 Wiki 页面时调用。

## 前置条件

**必须配置个人访问令牌（Personal Access Token）：**

```bash
# 在 ~/.zshrc 或 ~/.bashrc 中添加：
export CONFLUENCE_BEARER_TOKEN="你的令牌"
```

令牌获取方式：登录 wiki.kongfz.com → 个人资料 → 个人访问令牌 → 创建令牌。

**如果 `$CONFLUENCE_BEARER_TOKEN` 未配置或为空，必须停止执行并提示用户：**

> ⚠ 未检测到 CONFLUENCE_BEARER_TOKEN 环境变量。请在 ~/.zshrc 中配置 Confluence 个人访问令牌后重试。
> 获取方式：登录 wiki.kongfz.com → 个人资料 → 个人访问令牌 → 创建令牌

## API 基础

- 基地址：`https://wiki.kongfz.com/rest/api`
- 认证方式：`Authorization: Bearer $CONFLUENCE_BEARER_TOKEN`
- 内容格式：`body.storage`（HTML 存储格式）

## 读取页面

从 URL 提取 pageId，如 `https://wiki.kongfz.com/pages/viewpage.action?pageId=10401070` 中 pageId 为 `10401070`。

```bash
curl -s -H "Authorization: Bearer $CONFLUENCE_BEARER_TOKEN" \
  "https://wiki.kongfz.com/rest/api/content/{pageId}?expand=body.storage,version,space"
```

返回字段说明：
- `body.storage.value` — 页面 HTML 内容
- `version.number` — 当前版本号（更新时需要 +1）
- `space.key` — 所在空间 key
- `ancestors` — 父页面列表（创建子页面时需要）

## 搜索页面

```bash
# 按关键词搜索
curl -s -H "Authorization: Bearer $CONFLUENCE_BEARER_TOKEN" \
  "https://wiki.kongfz.com/rest/api/content/search?cql=type%3Dpage+AND+text~%22{关键词}%22&expand=space"
```

## 创建页面

```bash
curl -s -X POST \
  -H "Authorization: Bearer $CONFLUENCE_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  "https://wiki.kongfz.com/rest/api/content" \
  -d '{
    "type": "page",
    "title": "页面标题",
    "space": { "key": "SPACE_KEY" },
    "body": { "storage": { "value": "<p>页面内容 HTML</p>", "representation": "storage" } }
  }'
```

在指定页面下创建子页面时，请求体中加 `ancestors`：

```bash
-d '{
    "type": "page",
    "title": "子页面标题",
    "ancestors": [{ "id": "父页面ID" }],
    "space": { "key": "SPACE_KEY" },
    "body": { "storage": { "value": "<p>子页面内容</p>", "representation": "storage" } }
  }'
```

## 更新页面

更新时必须提供当前 version number + 1：

```bash
curl -s -X PUT \
  -H "Authorization: Bearer $CONFLUENCE_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  "https://wiki.kongfz.com/rest/api/content/{pageId}" \
  -d '{
    "type": "page",
    "title": "页面标题",
    "version": { "number": 当前版本号+1 },
    "body": { "storage": { "value": "<p>更新后的内容</p>", "representation": "storage" } }
  }'
```

## 列出空间

```bash
curl -s -H "Authorization: Bearer $CONFLUENCE_BEARER_TOKEN" \
  "https://wiki.kongfz.com/rest/api/space"
```

## 获取页面子页面

```bash
curl -s -H "Authorization: Bearer $CONFLUENCE_BEARER_TOKEN" \
  "https://wiki.kongfz.com/rest/api/content/{pageId}/child/page?expand=space"
```

## 常见错误处理

| 响应 | 含义 | 处理方式 |
|------|------|----------|
| `authorized: false` | 令牌无效/过期/权限不足 | 提示用户更新 CONFLUENCE_BEARER_TOKEN |
| HTTP 302 + 登录页 | 页面需要会话认证 | 提示令牌可能已过期 |
| `No content found with id` | pageId 不存在 | 确认 pageId 是否正确 |
| HTTP 400 | 请求参数错误 | 检查请求体格式 |
| HTTP 409 (冲突) | 版本号不匹配 | 重新获取最新 version.number 再更新 |

## 使用流程

1. **读取** — 用户给 URL → 提取 pageId → curl 获取内容 → 将 HTML 转为可读格式输出
2. **搜索** — 用户给关键词 → CQL 搜索 → 列出匹配页面标题和链接
3. **创建** — 确认空间 key 和标题 → 构建请求体 → 创建页面 → 返回新页面链接
4. **更新** — 先读取获取当前版本号 → 修改内容 → version.number+1 提交更新 → 确认成功
