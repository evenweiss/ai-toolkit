---
name: 孔网 Wiki
description: 读写孔网 Wiki（wiki.kongfz.com，Confluence REST）
---

# skill-kongfz-wiki

> Read and write company Wiki pages (wiki.kongfz.com) via Confluence REST API

**触发条件：** 用户分享孔网 Wiki 页面链接、或要求读取/搜索/创建/更新/删除 Wiki 页面时调用。

## 前置条件

**必须配置以下环境变量：**

```bash
# 在 ~/.zshrc 或 ~/.bashrc 中添加：
export CONFLUENCE_BASE_URL="https://wiki.kongfz.com"
export CONFLUENCE_BEARER_TOKEN="你的令牌"
```

令牌获取方式：登录 wiki.kongfz.com → 个人资料 → 个人访问令牌 → 创建令牌。

**如果环境变量未配置或为空，必须停止执行并提示用户：**

> ⚠ 未检测到 CONFLUENCE_BASE_URL 或 CONFLUENCE_BEARER_TOKEN 环境变量。请在 ~/.zshrc 中配置后重试。
> - CONFLUENCE_BASE_URL — 孔网 Wiki 服务根地址（Confluence REST，如 https://wiki.kongfz.com）
> - CONFLUENCE_BEARER_TOKEN — 个人访问令牌（登录 wiki → 个人资料 → 个人访问令牌 → 创建）

## API 基础

- 基地址：`$CONFLUENCE_BASE_URL/rest/api`
- 认证方式：`Authorization: Bearer $CONFLUENCE_BEARER_TOKEN`
- 内容格式：`body.storage`（HTML 存储格式）
- 通用请求头：`-H "Content-Type: application/json"`

## 空间管理

### 列出空间

```bash
curl -s -H "Authorization: Bearer $CONFLUENCE_BEARER_TOKEN" \
  "$CONFLUENCE_BASE_URL/rest/api/space?limit=50" | jq '.results[] | "\(.key)\t\(.name)"'
```

### 获取空间详情

```bash
curl -s -H "Authorization: Bearer $CONFLUENCE_BEARER_TOKEN" \
  "$CONFLUENCE_BASE_URL/rest/api/space/{spaceKey}?expand=homepage,description.plain" | jq .
```

### 获取空间下的页面

```bash
curl -s -H "Authorization: Bearer $CONFLUENCE_BEARER_TOKEN" \
  "$CONFLUENCE_BASE_URL/rest/api/content?spaceKey={spaceKey}&limit=50" | jq .
```

## 页面读取

### 获取页面内容

从 URL 提取 pageId，如 `$CONFLUENCE_BASE_URL/pages/viewpage.action?pageId=10401070` 中 pageId 为 `10401070`。

```bash
curl -s -H "Authorization: Bearer $CONFLUENCE_BEARER_TOKEN" \
  "$CONFLUENCE_BASE_URL/rest/api/content/{pageId}?expand=body.storage,version,space" | jq .
```

返回字段说明：
- `body.storage.value` — 页面 HTML 内容
- `version.number` — 当前版本号（更新时需要 +1）
- `space.key` — 所在空间 key
- `ancestors` — 父页面列表（创建子页面时需要）

### 获取页面历史

```bash
curl -s -H "Authorization: Bearer $CONFLUENCE_BEARER_TOKEN" \
  "$CONFLUENCE_BASE_URL/rest/api/content/{pageId}/history" | jq .
```

### 获取页面子页面

```bash
curl -s -H "Authorization: Bearer $CONFLUENCE_BEARER_TOKEN" \
  "$CONFLUENCE_BASE_URL/rest/api/content/{pageId}/child/page?expand=space" | jq .
```

## 页面搜索

### CQL 搜索

```bash
# 按关键词搜索
curl -s -H "Authorization: Bearer $CONFLUENCE_BEARER_TOKEN" \
  "$CONFLUENCE_BASE_URL/rest/api/content/search?cql=type%3Dpage+AND+text~%22{关键词}%22&limit=20" | jq .
```

### 高级 CQL 查询

```bash
# 按空间+标题模糊搜索
curl -s -H "Authorization: Bearer $CONFLUENCE_BEARER_TOKEN" \
  "$CONFLUENCE_BASE_URL/rest/api/content/search?cql=type%3Dpage+AND+space%3DKFZRepository+AND+title~%22进度%22&limit=20" | jq .

# 按创建者搜索
curl -s -H "Authorization: Bearer $CONFLUENCE_BEARER_TOKEN" \
  "$CONFLUENCE_BASE_URL/rest/api/content/search?cql=type%3Dpage+AND+creator%3DcurrentUser()" | jq .

# 最近7天更新的页面
curl -s -H "Authorization: Bearer $CONFLUENCE_BEARER_TOKEN" \
  "$CONFLUENCE_BASE_URL/rest/api/content/search?cql=type%3Dpage+AND+lastModified%3E%3D-7d&limit=20" | jq .
```

### 按标题查找页面

```bash
curl -s -H "Authorization: Bearer $CONFLUENCE_BEARER_TOKEN" \
  "$CONFLUENCE_BASE_URL/rest/api/content?title={标题}&spaceKey={spaceKey}" | jq .
```

## 页面创建

### 创建页面

```bash
curl -s -X POST \
  -H "Authorization: Bearer $CONFLUENCE_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  "$CONFLUENCE_BASE_URL/rest/api/content" \
  -d '{
    "type": "page",
    "title": "页面标题",
    "space": { "key": "SPACE_KEY" },
    "body": { "storage": { "value": "<p>页面内容 HTML</p>", "representation": "storage" } }
  }'
```

### 创建子页面（指定父页面）

```bash
curl -s -X POST \
  -H "Authorization: Bearer $CONFLUENCE_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  "$CONFLUENCE_BASE_URL/rest/api/content" \
  -d '{
    "type": "page",
    "title": "子页面标题",
    "ancestors": [{ "id": "父页面ID" }],
    "space": { "key": "SPACE_KEY" },
    "body": { "storage": { "value": "<p>子页面内容</p>", "representation": "storage" } }
  }'
```

## 页面更新

更新时必须提供当前 version number + 1：

```bash
# 1. 先获取当前版本号
curl -s -H "Authorization: Bearer $CONFLUENCE_BEARER_TOKEN" \
  "$CONFLUENCE_BASE_URL/rest/api/content/{pageId}?expand=version" | jq '.version.number'

# 2. 用版本号+1提交更新
curl -s -X PUT \
  -H "Authorization: Bearer $CONFLUENCE_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  "$CONFLUENCE_BASE_URL/rest/api/content/{pageId}" \
  -d '{
    "type": "page",
    "title": "页面标题",
    "version": { "number": 当前版本号+1 },
    "body": { "storage": { "value": "<p>更新后的内容</p>", "representation": "storage" } }
  }'
```

## 页面删除

```bash
# 移动到回收站
curl -s -X DELETE \
  -H "Authorization: Bearer $CONFLUENCE_BEARER_TOKEN" \
  "$CONFLUENCE_BASE_URL/rest/api/content/{pageId}"

# 永久删除（需要管理员权限）
curl -s -X DELETE \
  -H "Authorization: Bearer $CONFLUENCE_BEARER_TOKEN" \
  "$CONFLUENCE_BASE_URL/rest/api/content/{pageId}?status=trashed"
```

## 标签管理

### 获取页面标签

```bash
curl -s -H "Authorization: Bearer $CONFLUENCE_BEARER_TOKEN" \
  "$CONFLUENCE_BASE_URL/rest/api/content/{pageId}/label" | jq .
```

### 添加标签

```bash
curl -s -X POST \
  -H "Authorization: Bearer $CONFLUENCE_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  "$CONFLUENCE_BASE_URL/rest/api/content/{pageId}/label" \
  -d '[{ "prefix": "global", "name": "标签名" }]'
```

### 删除标签

```bash
curl -s -X DELETE \
  -H "Authorization: Bearer $CONFLUENCE_BEARER_TOKEN" \
  "$CONFLUENCE_BASE_URL/rest/api/content/{pageId}/label/{标签名}"
```

## 附件管理

### 列出附件

```bash
curl -s -H "Authorization: Bearer $CONFLUENCE_BEARER_TOKEN" \
  "$CONFLUENCE_BASE_URL/rest/api/content/{pageId}/child/attachment" | jq .
```

### 上传附件

```bash
curl -s -X POST \
  -H "Authorization: Bearer $CONFLUENCE_BEARER_TOKEN" \
  -H "X-Atlassian-Token: no-check" \
  -F "file=@/path/to/file" \
  "$CONFLUENCE_BASE_URL/rest/api/content/{pageId}/child/attachment"
```

### 下载附件

```bash
curl -s -H "Authorization: Bearer $CONFLUENCE_BEARER_TOKEN" \
  -O "$CONFLUENCE_BASE_URL/rest/api/content/{pageId}/child/attachment/{attachmentId}/download"
```

## 评论管理

### 获取页面评论

```bash
curl -s -H "Authorization: Bearer $CONFLUENCE_BEARER_TOKEN" \
  "$CONFLUENCE_BASE_URL/rest/api/content/{pageId}/child/comment?expand=body.storage" | jq .
```

### 添加评论

```bash
curl -s -X POST \
  -H "Authorization: Bearer $CONFLUENCE_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  "$CONFLUENCE_BASE_URL/rest/api/content" \
  -d '{
    "type": "comment",
    "container": { "id": "{pageId}", "type": "page" },
    "body": { "storage": { "value": "<p>评论内容</p>", "representation": "storage" } }
  }'
```

## 分页

列表类接口支持 `limit` 和 `start` 参数分页：

```bash
# 获取第2页，每页25条
curl -s -H "Authorization: Bearer $CONFLUENCE_BEARER_TOKEN" \
  "$CONFLUENCE_BASE_URL/rest/api/content?spaceKey=KFZRepository&limit=25&start=25" | jq .
```

响应中的 `_links.next` 指示是否有下一页。

## jq 格式化技巧

```bash
# 提取页面标题和ID
| jq '.results[] | "\(.id)\t\(.title)"'

# 提取页面内容
| jq '{ title: .title, content: .body.storage.value, version: .version.number }'

# 搜索结果提取
| jq -r '.results[] | "\(.id)\t\(.title)"'
```

## 常见错误处理

| 响应 | 含义 | 处理方式 |
|------|------|----------|
| `authorized: false` | 令牌无效/过期/权限不足 | 提示用户更新 CONFLUENCE_BEARER_TOKEN |
| HTTP 302 + 登录页 | 页面需要会话认证 | 提示令牌可能已过期 |
| `No content found with id` | pageId 不存在 | 确认 pageId 是否正确 |
| HTTP 400 | 请求参数错误 | 检查请求体格式 |
| HTTP 409 (冲突) | 版本号不匹配 | 重新获取最新 version.number 再更新 |
| HTTP 403 | 无权限操作 | 确认令牌权限或页面访问权限 |

## 使用流程

1. **读取** — 用户给 URL → 提取 pageId → curl 获取内容 → 将 HTML 转为可读格式输出
2. **搜索** — 用户给关键词 → CQL 搜索 → 列出匹配页面标题和链接
3. **创建** — 确认空间 key 和标题 → 构建请求体 → 创建页面 → 返回新页面链接
4. **更新** — 先读取获取当前版本号 → 修改内容 → version.number+1 提交更新 → 确认成功
5. **删除** — 确认页面 ID → DELETE 请求 → 页面移入回收站

## 参考文档

- Confluence REST API: https://developer.atlassian.com/cloud/confluence/rest/v1/
- CQL 语法: https://developer.atlassian.com/cloud/confluence/advanced-searching-using-cql/
- Storage Format: https://developer.atlassian.com/cloud/confluence/storage-format/
