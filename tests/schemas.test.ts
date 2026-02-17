/**
 * Schema Validation Tests
 * Validates that Zod schemas accept valid data, reject invalid data,
 * handle edge cases, and export correct JSON schemas for the SDK.
 */

import { describe, it, expect } from 'vitest';
import { ZodError } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';
import {
  ReviewReportSchema,
  CodeQualityResultSchema,
  TestCoverageResultSchema,
  RefactoringResultSchema,
} from '../src/types/index.js';

// ─── Helper: Valid fixture data ───────────────────────────────────────────────

const validCodeQualityIssue = {
  file: 'src/app.ts',
  line: 10,
  severity: 'high' as const,
  category: 'security' as const,
  description: 'SQL injection vulnerability',
  suggestion: 'Use parameterized queries',
};

const validTestSuggestion = {
  file: 'src/todoService.ts',
  functionName: 'createTodo',
  testDescription: 'Should throw when title is empty',
  exampleTest: "it('throws', () => expect(() => createTodo('')).toThrow())",
};

const validRefactoringSuggestion = {
  file: 'src/utils.ts',
  type: 'modernize' as const,
  description: 'Replace var with const',
  before: 'var x = 1;',
  after: 'const x = 1;',
  benefit: 'Block scoping prevents accidental reassignment',
};

const validCodeQuality = {
  issues: [validCodeQualityIssue],
  score: 75,
  summary: 'Found 1 high severity security issue',
};

const validTestCoverage = {
  estimatedCoverage: 55,
  untestedFunctions: ['createTodo', 'deleteTodo'],
  suggestions: [validTestSuggestion],
  score: 55,
  summary: 'Coverage is moderate at 55%',
};

const validRefactoring = {
  suggestions: [validRefactoringSuggestion],
  score: 80,
  summary: 'Minor modernization opportunities found',
};

const validReviewReport = {
  prNumber: 1,
  repository: 'airaamane/simple-todo-app',
  title: 'add clean code fixture',
  summary: 'Overall the PR is in good shape with minor issues',
  overallScore: 70,
  codeQuality: validCodeQuality,
  testCoverage: validTestCoverage,
  refactoring: validRefactoring,
};

// ─── CodeQualityResultSchema ──────────────────────────────────────────────────

describe('CodeQualityResultSchema', () => {
  it('accepts valid data', () => {
    expect(() => CodeQualityResultSchema.parse(validCodeQuality)).not.toThrow();
  });

  it('accepts empty issues array', () => {
    expect(() =>
      CodeQualityResultSchema.parse({ ...validCodeQuality, issues: [] })
    ).not.toThrow();
  });

  it('rejects missing score', () => {
    const { score: _, ...noScore } = validCodeQuality;
    expect(() => CodeQualityResultSchema.parse(noScore)).toThrow(ZodError);
  });

  it('rejects invalid severity', () => {
    const bad = {
      ...validCodeQuality,
      issues: [{ ...validCodeQualityIssue, severity: 'critical' }],
    };
    expect(() => CodeQualityResultSchema.parse(bad)).toThrow(ZodError);
  });

  it('rejects invalid category', () => {
    const bad = {
      ...validCodeQuality,
      issues: [{ ...validCodeQualityIssue, category: 'unknown' }],
    };
    expect(() => CodeQualityResultSchema.parse(bad)).toThrow(ZodError);
  });

  it('rejects score below 0', () => {
    expect(() =>
      CodeQualityResultSchema.parse({ ...validCodeQuality, score: -1 })
    ).toThrow(ZodError);
  });

  it('rejects score above 100', () => {
    expect(() =>
      CodeQualityResultSchema.parse({ ...validCodeQuality, score: 101 })
    ).toThrow(ZodError);
  });

  it('accepts boundary score of 0', () => {
    expect(() =>
      CodeQualityResultSchema.parse({ ...validCodeQuality, score: 0 })
    ).not.toThrow();
  });

  it('accepts boundary score of 100', () => {
    expect(() =>
      CodeQualityResultSchema.parse({ ...validCodeQuality, score: 100 })
    ).not.toThrow();
  });
});

// ─── TestCoverageResultSchema ─────────────────────────────────────────────────

describe('TestCoverageResultSchema', () => {
  it('accepts valid data', () => {
    expect(() => TestCoverageResultSchema.parse(validTestCoverage)).not.toThrow();
  });

  it('accepts empty untestedFunctions array', () => {
    expect(() =>
      TestCoverageResultSchema.parse({ ...validTestCoverage, untestedFunctions: [] })
    ).not.toThrow();
  });

  it('accepts empty suggestions array', () => {
    expect(() =>
      TestCoverageResultSchema.parse({ ...validTestCoverage, suggestions: [] })
    ).not.toThrow();
  });

  it('rejects missing estimatedCoverage', () => {
    const { estimatedCoverage: _, ...noField } = validTestCoverage;
    expect(() => TestCoverageResultSchema.parse(noField)).toThrow(ZodError);
  });

  it('rejects negative coverage percentage', () => {
    expect(() =>
      TestCoverageResultSchema.parse({ ...validTestCoverage, estimatedCoverage: -5 })
    ).toThrow(ZodError);
  });

  it('rejects coverage above 100', () => {
    expect(() =>
      TestCoverageResultSchema.parse({ ...validTestCoverage, estimatedCoverage: 105 })
    ).toThrow(ZodError);
  });
});

// ─── RefactoringResultSchema ──────────────────────────────────────────────────

describe('RefactoringResultSchema', () => {
  it('accepts valid data', () => {
    expect(() => RefactoringResultSchema.parse(validRefactoring)).not.toThrow();
  });

  it('accepts empty suggestions array', () => {
    expect(() =>
      RefactoringResultSchema.parse({ ...validRefactoring, suggestions: [] })
    ).not.toThrow();
  });

  it('rejects invalid suggestion type', () => {
    const bad = {
      ...validRefactoring,
      suggestions: [{ ...validRefactoringSuggestion, type: 'invalid-type' }],
    };
    expect(() => RefactoringResultSchema.parse(bad)).toThrow(ZodError);
  });

  it('rejects missing required suggestion fields', () => {
    const bad = {
      ...validRefactoring,
      suggestions: [{ file: 'src/x.ts', type: 'modernize' }],
    };
    expect(() => RefactoringResultSchema.parse(bad)).toThrow(ZodError);
  });
});

// ─── ReviewReportSchema ───────────────────────────────────────────────────────

describe('ReviewReportSchema', () => {
  it('accepts valid complete report', () => {
    expect(() => ReviewReportSchema.parse(validReviewReport)).not.toThrow();
  });

  it('rejects missing prNumber', () => {
    const { prNumber: _, ...noField } = validReviewReport;
    expect(() => ReviewReportSchema.parse(noField)).toThrow(ZodError);
  });

  it('rejects missing repository', () => {
    const { repository: _, ...noField } = validReviewReport;
    expect(() => ReviewReportSchema.parse(noField)).toThrow(ZodError);
  });

  it('rejects overallScore below 0', () => {
    expect(() =>
      ReviewReportSchema.parse({ ...validReviewReport, overallScore: -1 })
    ).toThrow(ZodError);
  });

  it('rejects overallScore above 100', () => {
    expect(() =>
      ReviewReportSchema.parse({ ...validReviewReport, overallScore: 101 })
    ).toThrow(ZodError);
  });

  it('accepts boundary overallScore of 0', () => {
    expect(() =>
      ReviewReportSchema.parse({ ...validReviewReport, overallScore: 0 })
    ).not.toThrow();
  });

  it('accepts boundary overallScore of 100', () => {
    expect(() =>
      ReviewReportSchema.parse({ ...validReviewReport, overallScore: 100 })
    ).not.toThrow();
  });

  it('rejects non-integer prNumber', () => {
    expect(() =>
      ReviewReportSchema.parse({ ...validReviewReport, prNumber: 1.5 })
    ).toThrow(ZodError);
  });
});

// ─── JSON Schema Export Validation ───────────────────────────────────────────

describe('JSON Schema Export (zodToJsonSchema)', () => {
  it('generates a valid JSON schema object for ReviewReportSchema', () => {
    const jsonSchema = zodToJsonSchema(ReviewReportSchema, {
      $refStrategy: 'root',
    });
    expect(jsonSchema).toBeDefined();
    expect(typeof jsonSchema).toBe('object');
  });

  it('schema has type "object"', () => {
    const jsonSchema = zodToJsonSchema(ReviewReportSchema, {
      $refStrategy: 'root',
    }) as any;
    // Root may be $defs wrapped; look for the object type
    const schema = jsonSchema.definitions?.ReviewReportSchema ?? jsonSchema;
    expect(schema.type ?? jsonSchema.type).toBeDefined();
  });

  it('required fields are present in JSON schema', () => {
    const jsonSchema = zodToJsonSchema(ReviewReportSchema, {
      $refStrategy: 'root',
    }) as any;
    const schema = jsonSchema.definitions?.ReviewReportSchema ?? jsonSchema;
    const required: string[] = schema.required ?? [];
    expect(required).toContain('prNumber');
    expect(required).toContain('repository');
    expect(required).toContain('overallScore');
  });
});
