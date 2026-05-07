# skill-git-push

完整 git 工作流：身份检测 → Code Review → 提交 → 推送。

## 使用方式

### 1. 安装

```bash
git clone https://github.com/evenweiss/ai-toolkit.git
cd ai-toolkit
pnpm install && pnpm build
```

### 2. 调用

```bash
# 完整流程：review + commit + push
node <项目目录>/packages/skill-git-push/dist/cli.js

# 仅做 review（不提交）
node <项目目录>/packages/skill-git-push/dist/cli.js --review

# 指定 commit message
node <项目目录>/packages/skill-git-push/dist/cli.js --message "fix: 修复登录bug"
```

**输出示例（成功）：**

```json
{
  "success": true,
  "review": {
    "passed": true,
    "projectType": "frontend",
    "issues": [],
    "summary": "Review 通过。检测到 42 行新增，3 行删除。"
  },
  "commitHash": "a1b2c3d4",
  "commitMessage": "feat(ui): 优化按钮组件"
}
```

**输出示例（review 不通过）：**

```json
{
  "success": false,
  "review": {
    "passed": false,
    "issues": [
      {
        "file": "src/auth/token.ts",
        "problem": "包含 console.log 调试代码",
        "suggestion": "删除 console.log",
        "severity": "warning"
      }
    ],
    "summary": "Review 不通过。发现 1 个问题。"
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

## Tool Schema

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
