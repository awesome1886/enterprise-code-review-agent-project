import * as dotenv from 'dotenv';
// Load .env variables immediately, before defining the config
dotenv.config();

import { McpServerConfig } from '@anthropic-ai/claude-agent-sdk';

export const mcpServerConfig: Record<string, McpServerConfig> = {
  github: {
    type: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    env: {
      GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_TOKEN || '',
    },
  },
  eslint: {
    type: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-eslint'],
  }
};