/**
 * Example plugin for AI coding agents
 */

export interface Tool {
  name: string;
  description: string;
  execute: (params: Record<string, unknown>) => Promise<unknown>;
}

export interface Plugin {
  name: string;
  version: string;
  tools: Tool[];
}

export function createPlugin(): Plugin {
  return {
    name: '@ai-toolkit/plugin-example',
    version: '0.0.1',
    tools: [
      {
        name: 'example-tool',
        description: 'An example tool for demonstration',
        execute: async (params) => {
          return { success: true, params };
        },
      },
    ],
  };
}

export default createPlugin;
