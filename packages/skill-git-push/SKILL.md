# skill-git-push

> Code review + commit + push workflow

**触发条件：** 用户说"帮我提交代码"、"commit"、"git push"、"审查并推送"。

## 工作流

```
1. [调用 skill-identity] ← 第一步
2. git status / git diff --stat / git diff
3. Code Review（发现问题则停止）
4. [调用 skill-git-commit 生成 commit message]
5. git add <files>
6. git commit -m "<message>"
7. git push
```

## Step 1: 调用 skill-identity

作为第一步，先调用 `skill-identity` 检测项目类型并设定身份。

**所有后续行为必须优先遵循「当前项目规则文件」的约束。**

## Step 2-3: Code Review

**审查重点：**
- bug / 逻辑漏洞 / 边界条件
- 拼写错误 / 命名不一致
- 与项目规范冲突
- 潜在风险（安全、性能、兼容性）

**判定：**
- 发现问题 → 输出问题清单与解决方案，**停止**
- 无问题 → 继续

## Step 4: 调用 skill-git-commit

使用 `skill-git-commit` skill 生成 commit message。

输入：当前项目的 `git diff` 输出
输出：Conventional Commits 格式的 commit message

## Step 5-7: 执行提交流程

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
## 身份识别（来自 skill-identity）
- 类型：前端项目
- 身份：高级前端开发工程师

## Review 结论
✅ 通过 / ❌ 不通过（附问题清单）

## 提交信息（来自 skill-git-commit）
```
<type>(<scope>): <subject>

<body>
```

## 执行结果
- git add: ✅/❌
- git commit: ✅/❌ (hash: <sha>)
- git push: ✅/❌
```
