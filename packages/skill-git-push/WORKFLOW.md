# git-push 工作流详解

## Step 0: 项目身份识别

读取项目配置文件判断类型：

- 前端：`package.json`（有 vue/react/ng 等）、小程序项目
- 后端：`pom.xml`（Java）、`go.mod`（Go）、`requirements.txt`（Python）、`Cargo.toml`（Rust）
- 全栈：同时存在前后端配置
- 其他：读取 `AGENTS.md`、`CLAUDE.md`、`README*`

## Step 1: Review 未提交代码

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

## Step 2: 生成提交信息

**格式：**

```
<type>(<scope>): <subject>

body（中文，描述变更背景、原因和关键实现）
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

## Step 3: 执行提交流程

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

## Step 4: 输出结果

```
## 项目类型识别
- 类型：前端项目
- 身份：高级前端开发工程师

## Review 结论
✅ 通过 / ❌ 不通过

## 提交信息
```
<type>(<scope>): <subject>

body
```

## 推送结果
✅ 成功（commit: <hash>） / ❌ 失败（<原因>）
```
