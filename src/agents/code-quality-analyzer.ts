import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { codeQualityAnalyzerPrompt } from '../prompts/index.js';
// REMOVED: The line "import { Skill } from..." has been deleted as it is no longer valid.
import { CodeQualityResultSchema } from '../types/index.js';

export const codeQualityAnalyzer: AgentDefinition = {
  name: 'code-quality-analyzer',
  description: 'Analyzes code for security vulnerabilities, performance issues, and maintainability concerns. Use this agent to assess the quality of source code files.',
  prompt: codeQualityAnalyzerPrompt,
  // EXPLICITLY define the tools the agent is allowed to use
  tools: ['Read', 'Grep', 'Glob', 'Skill'],
  // MUST be 'inherit' so it uses the model defined in your .env via the Orchestrator
  model: 'inherit',
  outputSchema: CodeQualityResultSchema,
};
