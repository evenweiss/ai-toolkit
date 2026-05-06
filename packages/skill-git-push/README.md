# @ai-toolkit/skill-git-push

Code review + commit + push workflow for AI coding agents.

适配 OpenCode、Claude Code、Cursor、Trae 等 AI 编码编辑器。

## 安装

### 方式一：作为 AI 编辑器自定义指令（推荐）

将 `skill.md` 内容复制到各编辑器的自定义指令配置中：

**Cursor**
```bash
# 复制到 Cursor commands 目录
cp skill.md ~/.cursor/commands/git-push.md
```

**Claude Code**
```bash
# 复制到 Claude commands 目录
cp skill.md ~/.claude/commands/git-push.md
```

**OpenCode / Trae**
```bash
# 复制到项目根目录或配置目录
cp skill.md <your-project>/AGENTS.md
# 或直接导入到编辑器的自定义指令配置中
```

---

### 方式二：作为 Hermes Agent Skill

```bash
# 克隆仓库
git clone https://github.com/evenweiss/ai-toolkit.git
cd ai-toolkit

# 安装依赖
pnpm install

# 构建
pnpm --filter @ai-toolkit/skill-git-push build
```

---

### 方式三：npm 包安装

```bash
# 发布后可通过 npm 安装
npm install @ai-toolkit/skill-git-push
```

---

## 工作流

```
审查未提交代码 → 生成提交信息 → 执行 git commit → 执行 git push
```

## 核心规则

1. **先 review，后提交** — 发现 bug/逻辑问题只提方案，不修复，不提交，不推送
2. **中文正文** — 提交信息 body 使用中文描述
3. **Conventional Commits** — 格式：`<type>(<scope>): <subject>`
4. **项目自适应** — 自动识别项目类型并切换对应身份

---

## 字段说明

| 字段 | 说明 |
|------|------|
| `type` | feat / fix / docs / style / refactor / test / chore / perf / ci |
| `scope` | 可选，模块范围（如 auth、api、components） |
| `subject` | 50 字以内，祈使句，简洁明确 |
| `body` | 中文描述本次变更背景、原因和关键实现 |

---

## 完整使用示例

当在 AI 编码编辑器中对当前改动调用此指令时：

```
/git-push
```

AI 会执行：

1. 读取项目信息，判断项目类型
2. 审查 `git diff` 中的所有未提交改动
3. 若发现问题 → 输出问题清单与解决方案，**停止**
4. 若通过 → 生成提交信息 → 执行 `git add && git commit && git push`

---

## License

MIT
