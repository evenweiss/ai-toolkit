#!/usr/bin/env node
/**
 * skill-identity CLI
 * Usage: node dist/cli.js [--path <dir>]
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

interface ProjectInfo {
  type: string;
  framework?: string;
  language?: string;
  hasTests: boolean;
  hasCI: boolean;
  packageManager?: string;
  buildTool?: string;
  monorepo?: boolean;
}

interface IdentityResult {
  identity: string;
  projectType: string;
  reasoning: string;
  files: string[];
}

const CONFIG_FILES: Record<string, string> = {
  'package.json': 'npm/pnpm/yarn',
  'pnpm-workspace.yaml': 'pnpm monorepo',
  'lerna.json': 'lerna monorepo',
  'nx.json': 'Nx monorepo',
  'turbo.json': 'Turborepo',
  'go.work': 'Go workspace',
  'vite.config.ts': 'Vite',
  'vite.config.js': 'Vite',
  'vite.config.mjs': 'Vite',
  'webpack.config.js': 'Webpack',
  'next.config.js': 'Next.js',
  'nuxt.config.ts': 'Nuxt',
  'astro.config.mjs': 'Astro',
  '.nvmrc': 'Node.js',
  '.tool-versions': 'asdf',
};

const TEST_FILES = [
  'jest.config.js', 'jest.config.ts', 'vitest.config.ts', 'vitest.config.js',
  'pytest.ini', 'setup.cfg', 'playwright.config.ts', '__tests__',
  'src/test', 'tests/', 'test/',
];

const CI_FILES = ['.github/workflows', '.gitlab-ci.yml', '.circleci/config.yml', 'Jenkinsfile', '.travis.yml'];

function scanDirectory(dir: string, depth = 0): string[] {
  if (depth > 3) return [];
  const files: string[] = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name === 'build' || entry.name === 'target') continue;
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...scanDirectory(fullPath, depth + 1));
      } else {
        files.push(entry.name);
      }
    }
  } catch {
    // ignore permission errors
  }
  return files;
}

function parsePackageJson(filePath: string, dir: string): { framework?: string; packageManager?: string; scripts?: Record<string, string> } {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const pkg = JSON.parse(content);
    const framework: string[] = [];

    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (deps['react']) framework.push('react');
    if (deps['vue']) framework.push('vue');
    if (deps['@nuxt/framework']) framework.push('nuxt');
    if (deps['next']) framework.push('next');
    if (deps['svelte']) framework.push('svelte');
    if (deps['@angular/core']) framework.push('angular');
    if (deps['express']) framework.push('express');
    if (deps['koa']) framework.push('koa');
    if (deps['egg']) framework.push('egg');
    if (deps['@nestjs/core']) framework.push('nest');
    if (deps['fastapi']) framework.push('fastapi');
    if (deps['django']) framework.push('django');
    if (deps['flask']) framework.push('flask');
    if (deps['spring-boot']) framework.push('spring');
    if (deps['mpvue']) framework.push('mpvue');
    if (deps['uni-app']) framework.push('uni-app');
    if (deps['weex']) framework.push('weex');
    if (deps['taro']) framework.push('taro');

    let packageManager = 'npm';
    if (existsSync(join(dir, 'pnpm-lock.yaml'))) packageManager = 'pnpm';
    else if (existsSync(join(dir, 'yarn.lock'))) packageManager = 'yarn';
    else if (existsSync(join(dir, 'bun.lock'))) packageManager = 'bun';

    return { framework: framework[0], packageManager, scripts: pkg.scripts };
  } catch {
    return {};
  }
}

function detectProjectType(dir: string, files: string[]): ProjectInfo {
  const info: ProjectInfo = { type: 'unknown', hasTests: false, hasCI: false };

  if (files.includes('pnpm-workspace.yaml') || files.includes('lerna.json') || files.includes('nx.json') || files.includes('turbo.json') || files.includes('go.work')) {
    info.monorepo = true;
    info.type = 'fullstack';
    return info;
  }

  if (files.includes('package.json')) {
    const pkgInfo = parsePackageJson(join(dir, 'package.json'), dir);
    if (pkgInfo.framework) info.framework = pkgInfo.framework;
    if (pkgInfo.packageManager) info.packageManager = pkgInfo.packageManager;

    const scripts = pkgInfo.scripts || {};
    if (scripts['dev'] || scripts['serve']) {
      if (['react', 'vue', 'svelte', 'angular', 'next', 'nuxt', 'astro'].includes(info.framework || '')) {
        info.type = 'frontend';
      }
    }
    if ((scripts['build'] && scripts['start']) || scripts['serve']) {
      info.type = info.type === 'unknown' ? 'backend' : info.type;
    }
  }

  if (!info.type || info.type === 'unknown') {
    if (files.includes('pom.xml')) { info.type = 'backend'; info.buildTool = 'maven'; }
    else if (files.includes('build.gradle')) { info.type = 'backend'; info.buildTool = 'gradle'; }
    else if (files.includes('go.mod')) { info.type = 'backend'; info.language = 'go'; }
    else if (files.includes('Cargo.toml')) { info.type = 'backend'; info.language = 'rust'; }
    else if (files.includes('composer.json')) { info.type = 'backend'; info.language = 'php'; }
    else if (files.includes('requirements.txt') || files.includes('setup.py')) { info.type = 'data-science'; info.language = 'python'; }
    else if (files.includes('Gemfile')) { info.type = 'backend'; info.language = 'ruby'; }
    else if (files.includes('go.work')) { info.type = 'backend'; info.language = 'go'; }
  }

  if (files.includes('Podfile') || files.includes('android/app/build.gradle') || files.includes('pubspec.yaml')) {
    info.type = 'mobile';
  }

  if (files.includes('vite.config.ts') || files.includes('vite.config.js') || files.includes('vite.config.mjs')) {
    info.type = info.type === 'unknown' ? 'frontend' : info.type;
    info.buildTool = 'vite';
  } else if (files.includes('webpack.config.js')) {
    info.type = info.type === 'unknown' ? 'frontend' : info.type;
    info.buildTool = 'webpack';
  }

  info.hasTests = TEST_FILES.some(f => files.includes(f) || files.some(file => file.includes(f.replace('*', ''))));
  info.hasCI = CI_FILES.some(f => files.some(file => file.includes(f)));

  if (!info.type) info.type = 'unknown';
  return info;
}

function determineIdentity(info: ProjectInfo): string {
  switch (info.type) {
    case 'frontend': return `高级前端开发工程师，精通 ${info.framework || 'React/Vue/TypeScript'} 技术栈`;
    case 'backend': return `高级后端开发工程师，精通 ${info.language || '主流后端技术'}`;
    case 'fullstack': return '高级全栈开发工程师，精通前后端技术栈';
    case 'mobile': return `高级移动端开发工程师，精通 ${info.framework || '移动端开发'}`;
    case 'data-science': return '高级数据科学工程师，精通 Python/数据分析/机器学习';
    case 'devops': return '高级 DevOps 工程师，精通 Kubernetes/Docker/CI-CD';
    default: return '通用高级软件工程师（项目类型判断依据不足）';
  }
}

function main() {
  const targetPath = process.argv.includes('--path')
    ? process.argv[process.argv.indexOf('--path') + 1]
    : process.cwd();

  const files = scanDirectory(targetPath);
  const info = detectProjectType(targetPath, files);
  const identity = determineIdentity(info);

  const result: IdentityResult = {
    identity,
    projectType: info.type,
    reasoning: [
      `检测目录: ${targetPath}`,
      `判定为: ${info.type}${info.framework ? ` (${info.framework})` : ''}${info.language ? ` [${info.language}]` : ''}`,
      info.buildTool ? `构建工具: ${info.buildTool}` : '',
      info.packageManager ? `包管理器: ${info.packageManager}` : '',
      info.monorepo ? 'Monorepo: 是' : '',
      info.hasTests ? '测试: 有' : '',
      info.hasCI ? 'CI: 有' : '',
    ].filter(Boolean).join(' | '),
    files: files.slice(0, 20),
  };

  console.log(JSON.stringify(result, null, 2));
}

main();
