import { z } from 'zod';

// --- 1. Sub-Agent Schemas ---

export const CodeQualityResultSchema = z.object({
  issues: z.array(z.object({
    file: z.string(),
    line: z.number(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    message: z.string(),
    suggestion: z.string().optional()
  }))
});

export const TestCoverageResultSchema = z.object({
  coverageAnalysis: z.object({
    coveredLines: z.number(),
    totalLines: z.number(),
    percentage: z.number(),
    missingTests: z.array(z.string()).optional()
  })
});

export const RefactoringResultSchema = z.object({
  suggestions: z.array(z.object({
    file: z.string(),
    description: z.string(),
    codeSnippet: z.string().optional()
  }))
});

// --- 2. Main Orchestrator Schema ---

export const ReviewReportSchema = z.object({
  summary: z.string().describe("A high-level summary of the code changes and review findings"),
  totalScore: z.number().min(0).max(100).describe("Overall quality score from 0-100"),
  files: z.array(z.object({
    name: z.string(),
    issues: z.array(z.object({
      line: z.number(),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      message: z.string(),
      suggestion: z.string().optional()
    })).optional(),
    testCoverage: z.object({
      coveredLines: z.number(),
      totalLines: z.number(),
      percentage: z.number(),
      missingTests: z.array(z.string()).optional()
    }).optional()
  })),
  refactoringSuggestions: z.array(z.object({
    file: z.string(),
    description: z.string(),
    codeSnippet: z.string().optional()
  })).optional()
});

// --- 3. Type Exports ---

export type ReviewReport = z.infer<typeof ReviewReportSchema>;
export type CodeQualityResult = z.infer<typeof CodeQualityResultSchema>;
export type TestCoverageResult = z.infer<typeof TestCoverageResultSchema>;
export type RefactoringResult = z.infer<typeof RefactoringResultSchema>;
