# skill-git-push

> Code review + commit + push workflow

**触发条件：** 用户说"帮我提交代码"、"commit"、"git push"、"审查并推送"。

## 核心规则

1. **先 review，后提交** — 执行 `git diff` 审查未提交代码
2. **发现问题立即停止** — 只输出问题与解决方案，**不修复、不提交、不推送**
3. **通过后执行** — `git add` → `git commit` → `git push`
4. **中文 body** — 描述变更背景、原因和关键实现
5. **Conventional Commits** — `<type>(<scope>): <subject>`

## 项目自适应身份

| 项目类型 | 身份 |
|---------|------|
| 前端/小程序 | 高级前端开发工程师 |
| 后端（Java/Go/Python等）| 高级后端开发工程师 |
| 其他 | 通用高级软件工程师 |

**必须优先遵循「当前项目规则文件」的约束。**

---

## 完整流程

### Step 0: 项目身份识别

读取项目配置文件判断类型：

- 前端：`package.json`（有 vue/react/ng 等）、小程序项目
- 后端：`pom.xml`（Java）、`go.mod`（Go）、`requirements.txt`（Python）、`Cargo.toml`（Rust）
- 全栈：同时存在前后端配置
- 其他：读取 `AGENTS.md`、`CLAUDE.md`、`README*`

### Step 1: Review 未提交代码

```bash
git status
git diff --stat
git diff
```

**审查重点：**
- bug / 逻辑漏洞 / 边界条件
- 拼写错误 / 命名不一致
- 与项目规范冲突
- 潜在风险（安全、性能、兼容性）

**判定：**
- 发现问题 → 输出问题清单与解决方案，**停止**
- 无问题 → 继续

### Step 2: 生成提交信息

**格式：**

```
<type>(<scope>): <subject>

<body>
```

**type：**
- `feat` 新功能
- `fix` 修复 bug
- `docs` 文档
- `style` 格式（不影响运行）
- `refactor` 重构
- `test` 测试
- `chore` 构建/工具
- `perf` 性能
- `ci` CI/CD

**示例：**

```
feat(auth): 添加 JWT token 刷新机制

在 token 过期前自动刷新，避免用户会话中断。
```

### Step 3: 执行提交流程

```bash
git add <files>
git commit -m "<message>"
git push
```

**失败处理：**
- 权限不足 → 检查 SSH/HTTPS 认证
- 冲突 → `git pull --rebase` 后重试
- 网络 → 检查代理设置
- 保护分支 → 申请权限或推送其他分支

---

## 输出格式

```
## 项目类型识别
- 类型：前端项目
- 身份：高级前端开发工程师

## Review 结论
✅ 通过 / ❌ 不通过

## 提交信息
```
<type>(<scope>): <subject>

<body>
```

## 推送结果
✅ 成功（commit: <hash>） / ❌ 失败（<原因>）
```
