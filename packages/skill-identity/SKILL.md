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

## 使用方式

把以下内容保存为对应编辑器命令目录中的文件：

**文件内容：**

```markdown
# skill-identity

## Tool Schema
{"name": "skill_identity", "description": "检测当前项目类型并返回 agent 身份设定", "inputSchema": {"type": "object", "properties": {"path": {"type": "string", "description": "要检测的目录路径，默认当前目录"}}}}

## CLI 调用
cd <项目目录> && node <skill-identity路径>/dist/cli.js
```

将以上内容保存到你的编辑器的 commands 目录中（AI 会自动找到合适的位置）。

## CLI 用法

```bash
node <skill-identity路径>/dist/cli.js [--path <目录>]
```

**示例输出：**

```json
{
  "identity": "高级前端开发工程师，精通 React/TypeScript 技术栈",
  "projectType": "frontend",
  "reasoning": "判定为: frontend (react) | 构建工具: vite"
}
```
