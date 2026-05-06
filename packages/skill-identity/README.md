# @ai-toolkit/skill-identity

Detect project type and set agent identity — foundation for all tasks.

适配 OpenCode、Claude Code、Cursor、Trae 等 AI 编码编辑器。

## 安装

### 方式一：复制 SKILL.md 到编辑器

```bash
# Cursor
cp packages/skill-identity/SKILL.md ~/.cursor/commands/identity.md

# Claude Code
cp packages/skill-identity/SKILL.md ~/.claude/commands/identity.md
```

### 方式二：Hermes Agent Skill

```bash
git clone https://github.com/evenweiss/ai-toolkit.git
cd ai-toolkit
pnpm install
pnpm --filter @ai-toolkit/skill-identity build
```

## 功能

1. **检测项目类型** — 前端/后端/全栈/移动端/数据科学等
2. **设定身份** — 返回匹配的 agent 身份描述
3. **项目元数据** — 框架、语言、测试、CI 等

## 工具函数

```typescript
import { detectIdentity } from '@ai-toolkit/skill-identity';

// 输入：项目文件存在情况
const result = await detectIdentity({
  'package.json': true,
  'vite.config.ts': true,
  'jest.config.js': true,
});

// 输出：identity + projectInfo + reasoning
```

## 配合其他 skill

```
skill-identity（身份）→ skill-git-push（执行提交推送）
skill-identity（身份）→ [任意其他任务]
```

## 文件结构

```
skill-identity/
├── SKILL.md          # 指令
├── src/detect.ts     # detectIdentity() 工具
├── package.json
└── README.md
```

## License

MIT
