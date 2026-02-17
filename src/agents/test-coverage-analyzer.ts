import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { testCoverageAnalyzerPrompt } from '../prompts/index.js';
import { TestCoverageResultSchema } from '../types/index.js';

export const TestCoverageAnalyzer: AgentDefinition = {
  name: 'test-coverage-analyzer',
  description: 'Evaluates test completeness and suggests specific test cases for untested code paths. Use this agent to find gaps in test coverage.',
  prompt: testCoverageAnalyzerPrompt,
  tools: [],
  model: 'claude-3-5-sonnet-20240620',
  outputSchema: TestCoverageResultSchema,
};