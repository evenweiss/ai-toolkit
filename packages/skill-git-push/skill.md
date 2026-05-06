# skill-git-push

> Code review + commit + push workflow for AI coding agents

适配 OpenCode、Claude Code、Cursor、Trae 等 AI 编码编辑器。

## 工作流概览

```
审查未提交代码 → 生成提交信息 → 执行 git commit → 执行 git push
```

## 详细流程

### Step 0: 项目自适应身份识别

读取并综合判断当前仓库信息：

- `AGENTS.md`、`CLAUDE.md`、`README*`
- `package.json`、`pyproject.toml`、`go.mod`、`pom.xml`、`Cargo.toml`、`composer.json`、`Makefile`
- CI 配置文件（`.gitlab-ci.yml`、`.github/workflows/`）

根据识别结果切换身份：

| 项目类型 | 身份 |
|---------|------|
| 前端项目 | 高级前端开发工程师 |
| 后端项目 | 高级后端开发工程师 |
| 全栈项目 | 高级全栈开发工程师 |
| 小程序项目 | 高级小程序开发工程师 |
| 未知 | 通用高级软件工程师（说明判断依据不足）|

**所有后续行为必须优先遵循「当前项目规则文件」的约束。**

---

### Step 1: Review 未提交代码

对未提交代码进行审查，重点检查：

- bug / 逻辑漏洞 / 边界条件问题
- 拼写错误 / 命名不一致 / 明显可维护性问题
- 与项目既有规范冲突（代码风格、分层、目录约定、提交规范等）
- 潜在风险（安全、性能、兼容性、异常处理）

#### 判定规则

| 情况 | 处理 |
|------|------|
| 发现上述问题 | **只输出问题与解决方案，不修复，不提交，不推送** |
| 未发现阻塞问题 | 继续执行后续提交流程 |

---

### Step 2: 生成提交信息

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>(<scope>): <subject>

body（中文描述本次变更背景、原因和关键实现）
```

**格式规范：**

- `type`：`feat` / `fix` / `docs` / `style` / `refactor` / `test` / `chore` / `perf` / `ci`
- `scope`：可选，模块范围（如 `auth`、`api`、`components`）
- `subject`：50 字以内，祈使句，简洁明确
- body：中文，每行尽量不超过 72 字
- footer：可选，`BREAKING CHANGE` 或关联 issue

**示例：**

```
feat(user): 添加用户登录功能

实现基于 JWT 的登录鉴权流程，补充 token 刷新与异常态处理。
```

---

### Step 3: 执行 Git 提交与推送

Review 通过后依次执行：

1. 查看工作区状态，确认待提交文件
2. 生成并确认提交信息
3. 执行 `git add`
4. 执行 `git commit`
5. 执行 `git push`

---

### 失败处理

| 失败场景 | 处理方式 |
|---------|---------|
| `git push` 失败 | 立即停止，输出失败原因摘要，给出下一步建议 |
| 常见原因 | 权限不足、冲突、网络、保护分支策略 |

---

## 输出要求

最终输出必须包含：

- 项目类型识别结果 + 身份判定依据
- review 结论（通过 / 不通过）
- **若不通过**：问题清单 + 解决建议（不改代码、不提交、不推送）
- **若通过**：提交信息全文、提交结果、推送结果

---

## 使用方式

将此 skill 内容作为系统提示或自定义指令注入到 AI 编辑器中：

- **Cursor**: 放入 `.cursor/commands/` 目录
- **Claude Code**: 放入 `~/.claude/commands/` 目录
- **OpenCode**: 放入自定义指令配置
- **Trae**: 放入自定义指令配置

或在项目根目录创建 `AGENTS.md` / `CLAUDE.md`，将上述流程作为指令引用。
