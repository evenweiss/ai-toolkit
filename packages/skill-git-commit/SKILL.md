# skill-git-commit

> Smart commit message generator with Conventional Commits

**触发条件：** 当用户要求"生成提交信息"、"帮我写 commit"、"写提交信息"时调用。

## 核心规则

1. **分析 diff** — 先 `git diff` 查看变更内容
2. **判断 type** — 根据变更类型选择 `feat`/`fix`/`docs`/`refactor` 等
3. **生成 subject** — ≤50字，祈使句，简洁描述变更
4. **生成 body** — 中文，描述变更背景、原因和关键实现

## 格式

```
<type>(<scope>): <subject>

<body>
```

## Type 判断标准

| 变更 | type |
|------|------|
| 新功能 | `feat` |
| bug 修复 | `fix` |
| 文档更新 | `docs` |
| 代码格式 | `style` |
| 重构（不改变功能）| `refactor` |
| 测试相关 | `test` |
| 构建/工具变更 | `chore` |
| 性能优化 | `perf` |
| CI/CD | `ci` |

## Scope 参考

模块名：如 `auth`、`api`、`components`、`utils`、`config`

无明确模块：`none`，如 `feat(none): 添加新功能`

## 示例

**变更：** 添加用户登录功能

```
feat(auth): 添加 JWT 登录接口

实现基于 token 的登录鉴权，支持 token 刷新与异常态处理。
```

**变更：** 修复按钮点击无响应问题

```
fix(Button): 修复移动端点击无响应

在 touchstart 事件中触发 click，避免 300ms 延迟。
```

## 与 skill-git-push 配合

```
skill-git-commit（生成提交信息）→ skill-git-push（执行提交推送）
```
