import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { testCoverageAnalyzerPrompt } from '../prompts/index.js';
import { TestCoverageResultSchema } from '../types/index.js';

export const testCoverageAnalyzer: AgentDefinition = {
  name: 'test-coverage-analyzer',
  description: 'Evaluates test completeness and suggests specific test cases.',
  prompt: testCoverageAnalyzerPrompt,
  tools: ['Read', 'Grep', 'Glob', 'Skill'],
  model: 'inherit',
  outputSchema: TestCoverageResultSchema,
};