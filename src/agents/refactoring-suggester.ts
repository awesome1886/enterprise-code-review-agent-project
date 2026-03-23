import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { refactoringSuggesterPrompt } from '../prompts/index.js';
import { RefactoringResultSchema } from '../types/index.js';

export const refactoringSuggester: AgentDefinition = {
  name: 'refactoring-suggester',
  description: 'Identifies opportunities to improve code structure and modernize patterns.',
  prompt: refactoringSuggesterPrompt,
  tools: ['Read', 'Grep', 'Glob', 'Skill'],
  model: 'inherit',
  outputSchema: RefactoringResultSchema,
};