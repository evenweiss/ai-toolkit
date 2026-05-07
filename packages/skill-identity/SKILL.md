# skill-identity

检测项目类型，自动设置 agent 身份。所有任务的基础能力。

## 使用方式

### 1. 安装

```bash
git clone https://github.com/evenweiss/ai-toolkit.git
cd ai-toolkit
pnpm install && pnpm build
```

### 2. 调用

```bash
node <项目目录>/packages/skill-identity/dist/cli.js [--path <检测目录>]
```

**示例：**

```bash
# 检测当前项目
node ~/projects/ai-toolkit/packages/skill-identity/dist/cli.js

# 检测指定目录
node ~/projects/ai-toolkit/packages/skill-identity/dist/cli.js --path /path/to/project
```

**输出示例：**

```json
{
  "identity": "高级前端开发工程师，精通 React/TypeScript 技术栈",
  "projectType": "frontend",
  "reasoning": "判定为: frontend (react) | 构建工具: vite"
}
```

## Tool Schema

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
