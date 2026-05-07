# skill-git-commit

从 git diff 智能生成符合 Conventional Commits 规范的 commit message。

## Tool

```json
{
  "name": "skill_git_commit",
  "description": "根据 git diff 内容生成 commit message 建议",
  "inputSchema": {
    "type": "object",
    "properties": {
      "diff": {
        "type": "string",
        "description": "git diff 输出（完整 unified diff 格式）"
      }
    }
  }
}
```

## CLI 用法

```bash
git diff | node <skill-git-commit路径>/dist/cli.js
node <skill-git-commit路径>/dist/cli.js --diff <diff文件>
```

**示例输出：**

```json
{
  "commit": {
    "full": "feat(auth): 添加登录功能\n\n实现基于 JWT 的登录鉴权流程。\n\n变更文件：\n+ src/auth/login.ts\n+ src/auth/token.ts",
    "line": "feat(auth): 添加登录功能",
    "type": "feat",
    "scope": "auth",
    "subject": "添加登录功能"
  },
  "stats": { "total": 2, "added": 2, "modified": 0, "deleted": 0 }
}
```

## 安装

将 SKILL.md 内容保存到编辑器的 commands 目录（AI 自动判断路径）。
