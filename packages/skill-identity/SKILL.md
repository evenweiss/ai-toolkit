# skill-identity

> Detect project type and set agent identity - foundation for all tasks

**触发条件：** 当用户说"检测项目类型"、"识别项目"、"设定身份"、"我是前端/后端工程师"时调用。

## 功能

1. **检测项目类型** — 分析项目文件结构，判断是前端/后端/全栈/移动端等
2. **设定身份** — 根据项目类型返回匹配的 agent 身份描述
3. **输出项目信息** — 包含框架、语言、测试、CI 等元数据

## 工具

调用 `detectIdentity(files: Record<string, boolean>)` 函数：

- 输入：项目文件存在情况，如 `{ 'package.json': true, 'pom.xml': false, 'go.mod': false }`
- 输出：`IdentityResult` 包含 `identity`、`projectInfo`、`reasoning`

## 项目类型判断

| 检测结果 | 身份 |
|---------|------|
| 前端（Vue/React/小程序等）| 高级前端开发工程师 |
| 后端（Java/Go/Python等）| 高级后端开发工程师 |
| 全栈 | 高级全栈开发工程师 |
| 移动端（iOS/Android）| 高级移动端开发工程师 |
| 数据科学 | 高级数据科学工程师 |
| DevOps | 高级 DevOps 工程师 |
| 未知 | 通用高级软件工程师 |

## 输出格式

```typescript
interface IdentityResult {
  identity: string;       // "高级前端开发工程师，精通..."
  projectInfo: {
    type: ProjectType;
    framework?: string;
    language?: string;
    hasTests: boolean;
    hasCI: boolean;
  };
  reasoning: string;      // 判断依据
}
```

## 与其他 skill 配合

```
skill-identity（身份）→ skill-git-push（执行）
skill-identity（身份）→ [任意其他任务]
```

## 使用场景

1. **首次接触项目时** — 调用此 skill 建立上下文身份
2. **git-push 时** — 作为第一步确定身份
3. **复杂项目多轮对话** — 明确身份后保持一致
