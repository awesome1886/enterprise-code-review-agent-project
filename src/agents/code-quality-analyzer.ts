import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { codeQualityAnalyzerPrompt } from '../prompts/index.js';
// REMOVED: The line "import { Skill } from..." has been deleted as it is no longer valid.
import { CodeQualityResultSchema } from '../types/index.js';

export const CodeQualityAnalyzer: AgentDefinition = {
  name: 'code-quality-analyzer',
  description: 'Analyzes code for security vulnerabilities, performance issues, and maintainability concerns. Use this agent to assess the quality of source code files.',
  prompt: codeQualityAnalyzerPrompt,
  // CORRECTED: The `tools` array is now empty. The SDK automatically provides
  // the Skill tool because the `.claude/skills` directory exists. The agent
  // will invoke skills based on the instructions in its prompt.
  tools: [],
  model: 'claude-3-5-sonnet-20240620',
  outputSchema: CodeQualityResultSchema,
};
