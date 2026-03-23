import { describe, it, expect } from 'vitest';
import { ReviewReportSchema } from '../src/types/index.js';

describe('ReviewReportSchema Validation', () => {
  const validData = {
    summary: "Code structure looks solid.",
    totalScore: 95,
    files: [
      {
        name: "index.js",
        issues: [
          { line: 10, severity: "low", message: "minor issue" }
        ],
        testCoverage: {
          coveredLines: 10,
          totalLines: 10,
          percentage: 100
        }
      }
    ]
  };

  it('should accept valid data matching the schema', () => {
    expect(() => ReviewReportSchema.parse(validData)).not.toThrow();
  });

  it('should throw an error for invalid data (score over 100)', () => {
    const invalidData = { ...validData, totalScore: 105 }; 
    expect(() => ReviewReportSchema.parse(invalidData)).toThrow();
  });

  it('should handle edge cases like empty arrays', () => {
    const emptyFiles = { ...validData, files: [] };
    expect(() => ReviewReportSchema.parse(emptyFiles)).not.toThrow();
  });
});