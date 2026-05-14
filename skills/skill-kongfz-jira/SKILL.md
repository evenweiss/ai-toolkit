---
name: 孔网 Jira
description: 查询与操作孔网 Jira 项目与 Issue（jira.kongfz.com）
---

# skill-kongfz-jira

> Query and manage Jira projects, issues, epics, and workflows via REST API

**触发条件：** 用户提到孔网 Jira：查询/创建/更新 Issue、JQL 搜索、Epic/Bug 统计、项目进度、Jira 链接等时调用。

## 前置条件

**必须配置以下环境变量：**

```bash
# 在 ~/.zshrc 或 ~/.bashrc 中添加：
export JIRA_BASE_URL="https://jira.kongfz.com"
export JIRA_BEARER_TOKEN="你的令牌"
```

令牌获取方式：登录 jira.kongfz.com → 个人资料 → 个人访问令牌 → 创建令牌。

**如果环境变量未配置或为空，必须停止执行并提示用户：**

> ⚠ 未检测到 JIRA_BASE_URL 或 JIRA_BEARER_TOKEN 环境变量。请在 ~/.zshrc 中配置后重试。
> - JIRA_BASE_URL — 孔网 Jira 服务根地址（如 https://jira.kongfz.com）
> - JIRA_BEARER_TOKEN — 个人访问令牌（登录 jira → 个人资料 → 个人访问令牌 → 创建）

## API 基础

- 基地址：`$JIRA_BASE_URL/rest/api/2`
- 认证方式：`Authorization: Bearer $JIRA_BEARER_TOKEN`
- 通用请求头：`-H "Content-Type: application/json" -H "Accept: application/json"`

## 验证连接

```bash
curl -s -H "Authorization: Bearer $JIRA_BEARER_TOKEN" \
  "$JIRA_BASE_URL/rest/api/2/myself" | jq '.displayName'
```

## 项目管理

### 获取项目列表

```bash
curl -s -H "Authorization: Bearer $JIRA_BEARER_TOKEN" \
  "$JIRA_BASE_URL/rest/api/2/project" | jq -r '.[] | "\(.key)\t\(.name)"'
```

### 获取项目详情

```bash
curl -s -H "Authorization: Bearer $JIRA_BEARER_TOKEN" \
  "$JIRA_BASE_URL/rest/api/2/project/{projectKey}" | jq .
```

### 获取项目版本列表

```bash
curl -s -H "Authorization: Bearer $JIRA_BEARER_TOKEN" \
  "$JIRA_BASE_URL/rest/api/2/project/{projectKey}/versions" | jq .
```

### 获取项目组件

```bash
curl -s -H "Authorization: Bearer $JIRA_BEARER_TOKEN" \
  "$JIRA_BASE_URL/rest/api/2/project/{projectKey}/components" | jq .
```

## Issue 操作

### 获取 Issue

```bash
curl -s -H "Authorization: Bearer $JIRA_BEARER_TOKEN" \
  "$JIRA_BASE_URL/rest/api/2/issue/{issueKey}?fields=summary,status,assignee,priority" | jq .
```

常用 fields：`summary`、`status`、`assignee`、`priority`、`description`、`created`、`updated`、`issuetype`、`labels`

### 创建 Issue

```bash
curl -s -X POST \
  -H "Authorization: Bearer $JIRA_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  "$JIRA_BASE_URL/rest/api/2/issue" \
  -d '{
    "fields": {
      "project": { "key": "PROJECT_KEY" },
      "summary": "Issue 标题",
      "description": "Issue 描述",
      "issuetype": { "name": "Task" }
    }
  }' | jq '.key'
```

常见 issuetype：`Task`、`Bug`、`Story`、`Sub-task`、`Epic`

### 创建子任务

```bash
curl -s -X POST \
  -H "Authorization: Bearer $JIRA_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  "$JIRA_BASE_URL/rest/api/2/issue" \
  -d '{
    "fields": {
      "project": { "key": "PROJECT_KEY" },
      "summary": "子任务标题",
      "issuetype": { "name": "Sub-task" },
      "parent": { "key": "PARENT-KEY" }
    }
  }' | jq '.key'
```

### 更新 Issue

```bash
curl -s -X PUT \
  -H "Authorization: Bearer $JIRA_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  "$JIRA_BASE_URL/rest/api/2/issue/{issueKey}" \
  -d '{"fields": {"summary": "更新后的标题"}}' -i
```

### 删除 Issue

```bash
curl -s -X DELETE \
  -H "Authorization: Bearer $JIRA_BEARER_TOKEN" \
  "$JIRA_BASE_URL/rest/api/2/issue/{issueKey}" -i
```

## JQL 搜索

### GET 方式搜索（简单查询）

```bash
# URL 编码的 JQL: project = SHOPA AND status = Open
curl -s -H "Authorization: Bearer $JIRA_BEARER_TOKEN" \
  "$JIRA_BASE_URL/rest/api/2/search?jql=project%20%3D%20SHOPA%20AND%20status%20%3D%20Open&maxResults=20&fields=key,summary,status" | jq .
```

### POST 方式搜索（复杂查询，推荐）

```bash
curl -s -X POST \
  -H "Authorization: Bearer $JIRA_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  "$JIRA_BASE_URL/rest/api/2/search" \
  -d '{
    "jql": "project = SHOPA AND status in (\"To Do\", \"In Progress\") ORDER BY updated DESC",
    "startAt": 0,
    "maxResults": 20,
    "fields": ["key", "summary", "status", "assignee", "updated"]
  }' | jq .
```

### 常用 JQL 模板

```bash
# 按 Epic 查询关联 Issue
"\"Epic Link\" = SHOPA-12203"

# 按 Epic 查询 Bug
"\"Epic Link\" = SHOPA-12203 AND issuetype = Bug"

# 按经办人查询
"assignee = currentUser()"

# 最近更新的 Issue
"project = SHOPA AND updated >= -7d ORDER BY updated DESC"

# 按状态统计
"project = SHOPA AND status = Open"

# 按组件查询
"project = SHOPA AND component = 店铺"
```

### 搜索结果格式化

```bash
# 提取 key + 标题
| jq -r '.issues[] | "\(.key)\t\(.fields.summary)"'

# 提取 key + 状态
| jq -r '.issues[] | "\(.key)\t\(.fields.status.name)"'

# 按状态统计
| jq -r '.issues[].fields.status.name' | sort | uniq -c
```

## 工作流（状态转换）

### 获取可用状态转换

```bash
curl -s -H "Authorization: Bearer $JIRA_BEARER_TOKEN" \
  "$JIRA_BASE_URL/rest/api/2/issue/{issueKey}/transitions" | jq '.transitions[] | "\(.id)\t\(.name)"'
```

### 执行状态转换

```bash
curl -s -X POST \
  -H "Authorization: Bearer $JIRA_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  "$JIRA_BASE_URL/rest/api/2/issue/{issueKey}/transitions" \
  -d '{"transition": {"id": "转换ID"}}' -i
```

## 评论

### 获取评论列表

```bash
curl -s -H "Authorization: Bearer $JIRA_BEARER_TOKEN" \
  "$JIRA_BASE_URL/rest/api/2/issue/{issueKey}/comment" | jq .
```

### 添加评论

```bash
curl -s -X POST \
  -H "Authorization: Bearer $JIRA_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  "$JIRA_BASE_URL/rest/api/2/issue/{issueKey}/comment" \
  -d '{"body": "评论内容"}' | jq '.id'
```

### 更新评论

```bash
curl -s -X PUT \
  -H "Authorization: Bearer $JIRA_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  "$JIRA_BASE_URL/rest/api/2/issue/{issueKey}/comment/{commentId}" \
  -d '{"body": "更新后的评论"}' -i
```

### 删除评论

```bash
curl -s -X DELETE \
  -H "Authorization: Bearer $JIRA_BEARER_TOKEN" \
  "$JIRA_BASE_URL/rest/api/2/issue/{issueKey}/comment/{commentId}" -i
```

## 附件

### 上传附件

```bash
curl -s -X POST \
  -H "Authorization: Bearer $JIRA_BEARER_TOKEN" \
  -H "X-Atlassian-Token: no-check" \
  -F "file=@/path/to/file" \
  "$JIRA_BASE_URL/rest/api/2/issue/{issueKey}/attachments" | jq .
```

### 查看附件列表

```bash
curl -s -H "Authorization: Bearer $JIRA_BEARER_TOKEN" \
  "$JIRA_BASE_URL/rest/api/2/issue/{issueKey}?fields=attachment" | jq '.fields.attachment'
```

### 下载附件

```bash
curl -s -H "Authorization: Bearer $JIRA_BEARER_TOKEN" \
  -o "/path/to/save" \
  "$JIRA_BASE_URL/secure/attachment/{attachmentId}/{filename}"
```

## 工时记录

### 获取工时

```bash
curl -s -H "Authorization: Bearer $JIRA_BEARER_TOKEN" \
  "$JIRA_BASE_URL/rest/api/2/issue/{issueKey}/worklog" | jq .
```

### 添加工时

```bash
curl -s -X POST \
  -H "Authorization: Bearer $JIRA_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  "$JIRA_BASE_URL/rest/api/2/issue/{issueKey}/worklog" \
  -d '{"timeSpent": "2h", "comment": "开发耗时"}' | jq .
```

## 变更历史

### 获取 Issue 变更记录

```bash
curl -s -H "Authorization: Bearer $JIRA_BEARER_TOKEN" \
  "$JIRA_BASE_URL/rest/api/2/issue/{issueKey}/changelog" | jq .
```

## 组件管理

### 创建组件

```bash
curl -s -X POST \
  -H "Authorization: Bearer $JIRA_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  "$JIRA_BASE_URL/rest/api/2/component" \
  -d '{
    "name": "组件名",
    "description": "组件描述",
    "project": "PROJECT_KEY"
  }' | jq .
```

### 更新组件

```bash
curl -s -X PUT \
  -H "Authorization: Bearer $JIRA_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  "$JIRA_BASE_URL/rest/api/2/component/{componentId}" \
  -d '{"name": "新组件名", "description": "新描述"}' | jq .
```

### 删除组件

```bash
# 可选 moveIssuesTo 将关联 Issue 转移到其他组件
curl -s -X DELETE \
  -H "Authorization: Bearer $JIRA_BEARER_TOKEN" \
  "$JIRA_BASE_URL/rest/api/2/component/{componentId}?moveIssuesTo={targetComponentId}" -i
```

## 用户查询

### 获取当前用户

```bash
curl -s -H "Authorization: Bearer $JIRA_BEARER_TOKEN" \
  "$JIRA_BASE_URL/rest/api/2/myself" | jq '.displayName'
```

### 搜索用户

```bash
curl -s -H "Authorization: Bearer $JIRA_BEARER_TOKEN" \
  "$JIRA_BASE_URL/rest/api/2/user/search?username={关键词}" | jq '.[] | "\(.name)\t\(.displayName)"'
```

## 分页

搜索接口支持 `startAt` 和 `maxResults` 分页：

```bash
# 获取第2页，每页50条
curl -s -X POST \
  -H "Authorization: Bearer $JIRA_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  "$JIRA_BASE_URL/rest/api/2/search" \
  -d '{
    "jql": "project = SHOPA",
    "startAt": 50,
    "maxResults": 50,
    "fields": ["key", "summary", "status"]
  }' | jq .
```

响应中 `total` 字段为总结果数，`startAt` + `maxResults` < `total` 时还有下一页。

## 调试技巧

```bash
# 保留响应头 + 状态码
curl -s -D /tmp/resp.headers -o /tmp/resp.json \
  -H "Authorization: Bearer $JIRA_BEARER_TOKEN" \
  "$JIRA_BASE_URL/rest/api/2/issue/{issueKey}"
cat /tmp/resp.headers
jq . /tmp/resp.json

# 快速判断 HTTP 状态码
HTTP_CODE=$(curl -s -o /tmp/resp.json -w "%{http_code}" \
  -H "Authorization: Bearer $JIRA_BEARER_TOKEN" \
  "$JIRA_BASE_URL/rest/api/2/myself")
echo "HTTP_CODE=$HTTP_CODE"
```

## 常见错误处理

| 响应 | 含义 | 处理方式 |
|------|------|----------|
| HTTP 401 | 令牌无效/过期 | 提示用户更新 JIRA_BEARER_TOKEN |
| HTTP 403 | 无权限操作 | 确认令牌权限或项目访问权限 |
| HTTP 404 | Issue/项目不存在 | 确认 key 是否正确 |
| HTTP 400 | JQL 语法错误或请求参数错误 | 检查 JQL 语法和请求体 |
| `errorMessages` in response | 服务端错误信息 | 读取具体错误提示 |

## 使用流程

1. **查询 Issue** — 用户给 issueKey → curl 获取 → 提取关键字段输出
2. **搜索** — 用户给条件 → 构造 JQL → POST 搜索 → 格式化结果
3. **创建** — 确认项目 key、类型、标题 → 构建请求体 → 创建 → 返回 issueKey
4. **状态转换** — 获取可用 transitions → 选择目标状态 → 执行转换
5. **Epic 分析** — 用 `"Epic Link" = KEY` 查询关联 Issue → 按 issuetype 分类统计

## 参考文档

- Jira REST API v2: https://developer.atlassian.com/cloud/jira/platform/rest/v2/
- JQL 语法: https://support.atlassian.com/jira-software-cloud/docs/construct-search-queries-using-jira-query-language-jql/
