/**
 * Detect project type and determine agent identity
 */

export type ProjectType =
  | 'frontend'      // Vue/React/Angular/Svelte/小程序
  | 'backend'       // Java/Go/Python/Node.js/Rust
  | 'fullstack'     // Mixed frontend + backend
  | 'mobile'        // iOS/Android/Flutter/React Native
  | 'embedded'      // C/C++ 嵌入式
  | 'data-science'  // Python/数据科学
  | 'devops'        // Kubernetes/Docker/基础设施
  | 'unknown';

export interface ProjectInfo {
  type: ProjectType;
  framework?: string;      // e.g., 'vue', 'react', 'spring', 'django'
  language?: string;       // e.g., 'typescript', 'java', 'python'
  hasTests: boolean;
  hasCI: boolean;
  packageManager?: string; // 'npm' | 'pnpm' | 'yarn' | 'maven' | 'gradle'
  buildTool?: string;      // 'vite' | 'webpack' | 'gradle' | 'maven'
}

export interface IdentityResult {
  identity: string;
  projectInfo: ProjectInfo;
  reasoning: string;
}

const FRONTEND_FRAMEWORKS = ['vue', 'react', 'angular', 'svelte', 'rax', 'uni-app', 'taro', 'mpvue'];
const BACKEND_FRAMEWORKS = ['spring', 'django', 'flask', 'fastapi', 'express', 'koa', 'egg', 'nest'];
const MOBILE_FRAMEWORKS = ['ios', 'android', 'flutter', 'react-native', 'weex', 'kotlin', 'swift'];

const FRONTEND_PACKAGE_FILES = ['package.json'];
const BACKEND_PACKAGE_FILES = ['pom.xml', 'go.mod', 'requirements.txt', 'Cargo.toml', 'composer.json', 'Gemfile'];
const MOBILE_PACKAGE_FILES = ['Podfile', ' Podfile.lock', 'android/app/build.gradle', 'pubspec.yaml'];

/**
 * Detect project type from file presence and contents
 */
export async function detectProject(files: Record<string, boolean>): Promise<ProjectInfo> {
  const info: ProjectInfo = {
    type: 'unknown',
    hasTests: false,
    hasCI: false,
  };

  // Check package.json for frontend/node projects
  if (files['package.json']) {
    // TODO: Actually read and parse package.json to detect framework
    // For now, detect based on file patterns
    if (files['vite.config.ts'] || files['vite.config.js'] || files['webpack.config.js']) {
      info.buildTool = 'vite';
      info.type = 'frontend';
      info.framework = 'unknown'; // Would need to parse package.json
      info.packageManager = 'npm';
    } else if (files['pnpm-workspace.yaml']) {
      info.type = 'fullstack';
      info.packageManager = 'pnpm';
    }
  }

  // Check backend package files
  if (files['pom.xml']) {
    info.type = 'backend';
    info.buildTool = 'maven';
  } else if (files['go.mod']) {
    info.type = 'backend';
    info.language = 'go';
  } else if (files['requirements.txt'] || files['setup.py']) {
    info.type = 'data-science';
    info.language = 'python';
  } else if (files['Cargo.toml']) {
    info.type = 'backend';
    info.language = 'rust';
  } else if (files['composer.json']) {
    info.type = 'backend';
    info.language = 'php';
  }

  // Check mobile
  if (files['Podfile'] || files['android/app/build.gradle']) {
    info.type = 'mobile';
  }

  // Check for tests
  info.hasTests = files['jest.config.js'] ||
                  files['vitest.config.ts'] ||
                  files['pytest.ini'] ||
                  files['src/test'] ||
                  files['__tests__'] ||
                  files['*.test.ts'] ||
                  files['*.spec.ts'];

  // Check for CI
  info.hasCI = files['.github/workflows'] ||
               files['.gitlab-ci.yml'] ||
               files['.circleci/config.yml'] ||
               files['Jenkinsfile'];

  return info;
}

/**
 * Determine agent identity based on project info
 */
export function determineIdentity(projectInfo: ProjectInfo): string {
  const type = projectInfo.type;

  switch (type) {
    case 'frontend':
      return '高级前端开发工程师，精通 Vue/Vite/TypeScript/CSS 等技术栈';
    case 'backend':
      return '高级后端开发工程师，精通 ' + (projectInfo.language || '主流后端技术');
    case 'fullstack':
      return '高级全栈开发工程师，精通前后端技术栈';
    case 'mobile':
      return '高级移动端开发工程师，精通 ' + (projectInfo.framework || '移动端开发');
    case 'data-science':
      return '高级数据科学工程师，精通 Python/数据分析/机器学习';
    case 'devops':
      return '高级 DevOps 工程师，精通 Kubernetes/Docker/CI-CD';
    default:
      return '通用高级软件工程师（项目类型判断依据不足）';
  }
}

/**
 * Full detection + identity workflow
 */
export async function detectIdentity(files: Record<string, boolean>): Promise<IdentityResult> {
  const projectInfo = await detectProject(files);
  const identity = determineIdentity(projectInfo);

  const typeLabels: Record<ProjectType, string> = {
    frontend: '前端项目',
    backend: '后端项目',
    fullstack: '全栈项目',
    mobile: '移动端项目',
    embedded: '嵌入式项目',
    'data-science': '数据科学项目',
    devops: 'DevOps 项目',
    unknown: '未知类型项目',
  };

  return {
    identity,
    projectInfo,
    reasoning: `根据项目文件检测结果，判定为"${typeLabels[projectInfo.type]}"。${projectInfo.framework ? `主要框架：${projectInfo.framework}。` : ''}${projectInfo.language ? `语言：${projectInfo.language}。` : ''}`,
  };
}
