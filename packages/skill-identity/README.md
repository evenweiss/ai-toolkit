# skill-identity

检测项目类型，自动设置 agent 身份。不只是 git，所有任务都能用它来确定上下文。

## 安装

给 AI 执行：

```markdown
把 https://raw.githubusercontent.com/evenweiss/ai-toolkit/main/packages/skill-identity/SKILL.md 复制到你的编辑器命令目录：
- Cursor：~/.cursor/commands/identity.md
- Claude Code：~/.claude/commands/identity.md
- OpenCode：~/.opencode/commands/identity.md
- Trae：~/.trae/commands/identity.md
```

## 使用

在编辑器中触发命令，输入 `/identity` 或直接调用 skill。

检测成功后输出示例：

```
[identity] 检测到项目类型： next.js
[identity] 设置 agent 身份： 前端开发者，擅长 React/TypeScript
```
