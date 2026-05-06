# @ai-toolkit/skill-identity

Detect project type and set agent identity - foundation for all tasks.

## 安装

```bash
cp SKILL.md ~/.cursor/commands/identity.md
```

## 功能

1. **检测项目类型** — 前端/后端/全栈/移动端/数据科学等
2. **设定身份** — 返回匹配的 agent 身份描述
3. **项目元数据** — 框架、语言、测试、CI 等

## 与其他 skill 配合

```
skill-identity（身份）→ skill-git-push（执行）
skill-identity（身份）→ [任意其他任务]
```

## License

MIT
