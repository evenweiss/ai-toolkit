# skill-identity

检测项目类型，自动设置 agent 身份。所有任务的基础能力。

## Tool

```json
{
  "name": "skill_identity",
  "description": "检测当前项目类型并返回 agent 身份设定",
  "inputSchema": {
    "type": "object",
    "properties": {
      "path": {
        "type": "string",
        "description": "要检测的目录路径，默认当前目录"
      }
    }
  }
}
```

## 使用方式（terminal 工具）

```bash
node /path/to/skill-identity/dist/cli.js [--path <dir>]
```

**示例：**

```bash
node ~/projects/ai-toolkit/packages/skill-identity/dist/cli.js
```

**输出：**

```json
{
  "identity": "高级前端开发工程师，精通 React/TypeScript 技术栈",
  "projectType": "frontend",
  "reasoning": "检测目录: /path/to/project | 判定为: frontend (react) | 构建工具: vite | 包管理器: pnpm"
}
```

## 安装

给 AI 执行：

```markdown
把 https://raw.githubusercontent.com/evenweiss/ai-toolkit/main/packages/skill-identity/SKILL.md 复制到你的编辑器命令目录：
- Cursor：~/.cursor/commands/identity.md
- Claude Code：~/.claude/commands/identity.md
```

或通过 install.sh 安装 CLI：

```bash
curl -sSL https://raw.githubusercontent.com/evenweiss/ai-toolkit/main/install.sh | bash
```
