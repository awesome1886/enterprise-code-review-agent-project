import * as dotenv from 'dotenv';
// Load .env variables immediately, before defining the config
dotenv.config();

import { McpServerConfig } from '@anthropic-ai/claude-agent-sdk';

export const mcpServerConfig: Record<string, McpServerConfig> = {
  github: {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    env: {
      // Now this will definitely have the value from your .env file
      GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_TOKEN || '',
    },
  },
  eslint: {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-eslint'],
  },
};
