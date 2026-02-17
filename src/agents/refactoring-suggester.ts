import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { refactoringSuggesterPrompt } from '../prompts/index.js';
import { RefactoringResultSchema } from '../types/index.js';

export const RefactoringSuggester: AgentDefinition = {
  name: 'refactoring-suggester',
  description: 'Identifies opportunities to improve code structure, apply modern design patterns, and increase clarity. Use this agent to get suggestions for refactoring.',
  prompt: refactoringSuggesterPrompt,
  tools: [],
  model: 'claude-3-5-sonnet-20240620',
  outputSchema: RefactoringResultSchema,
};
