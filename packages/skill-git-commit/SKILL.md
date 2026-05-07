# skill-git-commit

从 git diff 智能生成符合 Conventional Commits 规范的 commit message。

## 使用方式

### 1. 安装

```bash
git clone https://github.com/evenweiss/ai-toolkit.git
cd ai-toolkit
pnpm install && pnpm build
```

### 2. 调用

```bash
git diff | node <项目目录>/packages/skill-git-commit/dist/cli.js
# 或指定 diff 文件
node <项目目录>/packages/skill-git-commit/dist/cli.js --diff <diff文件>
```

**示例：**

```bash
git diff | node ~/projects/ai-toolkit/packages/skill-git-commit/dist/cli.js
```

**输出示例：**

```json
{
  "commit": {
    "full": "feat(auth): 添加登录功能\n\n实现基于 JWT 的登录鉴权流程。",
    "line": "feat(auth): 添加登录功能",
    "type": "feat",
    "scope": "auth",
    "subject": "添加登录功能"
  },
  "stats": { "total": 2, "added": 2, "modified": 0, "deleted": 0 }
}
```

## Tool Schema

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
