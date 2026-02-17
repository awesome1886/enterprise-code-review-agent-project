// This file acts as a central hub for all agent definitions.

import { codeQualityAnalyzer } from './code-quality-analyzer.js';
import { testCoverageAnalyzer } from './test-coverage-analyzer.js';
import { refactoringSuggester } from './refactoring-suggester.js';

// We export the agent variables so other files, like the orchestrator, can import them.
export {
  codeQualityAnalyzer,
  testCoverageAnalyzer,
  refactoringSuggester,
};
