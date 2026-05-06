# skill-git-push

> Code review + commit + push workflow (with skill-git-commit integration)

**触发条件：** 用户说"帮我提交代码"、"commit"、"git push"、"审查并推送"。

## 核心规则

1. **先 review，后提交** — 执行 `git diff` 审查未提交代码
2. **发现问题立即停止** — 只输出问题与解决方案，**不修复、不提交、不推送**
3. **通过后生成提交信息** — 调用 `skill-git-commit` skill 生成 commit message
4. **执行提交流程** — `git add` → `git commit` → `git push`
5. **中文 body** — 描述变更背景、原因和关键实现
6. **Conventional Commits** — `<type>(<scope>): <subject>`

## 工作流

```
1. git status / git diff --stat / git diff
      ↓
2. Code Review（发现问题则停止）
      ↓
3. [调用 skill-git-commit skill 生成 commit message]
      ↓
4. git add <files>
5. git commit -m "<message>"
6. git push
```

## 调用 skill-git-commit

当需要生成 commit message 时，通过 agent 的 skill 调用机制调用 `skill-git-commit`。

输入：当前项目的 git diff 信息
输出：Conventional Commits 格式的 commit message

---

## 项目自适应身份

| 项目类型 | 身份 |
|---------|------|
| 前端/小程序 | 高级前端开发工程师 |
| 后端（Java/Go/Python等）| 高级后端开发工程师 |
| 其他 | 通用高级软件工程师 |

**必须优先遵循「当前项目规则文件」的约束。**

---

## 输出格式

```
## 项目类型识别
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
