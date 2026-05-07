# skill-git-push

完整 git 工作流：身份检测 → Code Review → 提交 → 推送。

## Tool

```json
{
  "name": "skill_git_push",
  "description": "执行完整 git 提交流程：先 review，发现问题则停止；通过则 commit 并 push",
  "inputSchema": {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "description": "可选，手动指定 commit message"
      }
    }
  }
}
```

## 使用方式（terminal 工具）

```bash
node /path/to/skill-git-push/dist/cli.js [--message "custom commit msg"]
```

**完整流程示例：**

```bash
# 1. 检测身份
node ~/projects/ai-toolkit/packages/skill-identity/dist/cli.js

# 2. 仅做 review（不提交）
node ~/projects/ai-toolkit/packages/skill-git-push/dist/cli.js --review

# 3. 执行完整 review + commit + push
node ~/projects/ai-toolkit/packages/skill-git-push/dist/cli.js
```

**输出：**

```json
{
  "success": true,
  "review": {
    "passed": true,
    "projectType": "frontend",
    "identity": "高级前端开发工程师",
    "issues": [],
    "summary": "Review 通过。检测到 42 行新增，3 行删除。"
  },
  "commitHash": "a1b2c3d4",
  "commitMessage": "feat(ui): 优化按钮组件\n\n优化 Button 组件的样式与交互..."
}
```

**Review 不通过时：**

```json
{
  "success": false,
  "review": {
    "passed": false,
    "issues": [
      { "file": "src/auth/token.ts", "problem": "可能包含敏感信息硬编码", "suggestion": "使用环境变量", "severity": "error" }
    ],
    "summary": "Review 不通过。发现 1 个问题..."
  },
  "error": "Review 不通过，请先解决上述问题"
}
```

## 工作流

```
1. skill-identity → 检测项目类型
2. Code Review → 发现错误则停止
3. skill-git-commit → 生成 commit message
4. git add → git commit → git push
```

## 安装

```bash
curl -sSL https://raw.githubusercontent.com/evenweiss/ai-toolkit/main/install.sh | bash all
```
