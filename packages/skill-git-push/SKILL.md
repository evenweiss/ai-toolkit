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

## CLI 用法

```bash
# 完整流程：review + commit + push
node <skill-git-push路径>/dist/cli.js

# 仅做 review
node <skill-git-push路径>/dist/cli.js --review

# 指定 commit message
node <skill-git-push路径>/dist/cli.js --message "fix: 修复登录bug"
```

**输出示例：**

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

## 工作流

```
1. skill-identity → 检测项目类型
2. Code Review → 发现错误则停止
3. skill-git-commit → 生成 commit message
4. git add → git commit → git push
```

## 安装

将 SKILL.md 内容保存到编辑器的 commands 目录（AI 自动判断路径）。
