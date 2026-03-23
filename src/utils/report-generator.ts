import * as fs from 'fs';
import * as path from 'path';
import { type ReviewReport } from '../types/index.js';

export class ReportGenerator {
  async generateAll(report: ReviewReport, baseFilename: string): Promise<void> {
    const reportDir = path.join(process.cwd(), 'reports');
    
    // Create the 'reports' directory if it doesn't exist
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const jsonPath = path.join(reportDir, `${baseFilename}.json`);
    const mdPath = path.join(reportDir, `${baseFilename}.md`);
    const htmlPath = path.join(reportDir, `${baseFilename}.html`);

    // 1. Generate JSON
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

    // 2. Generate Markdown
    const mdContent = `
# Pull Request Code Review

**Summary:** ${report.summary}
**Total Score:** ${report.totalScore}/100

## Files Analyzed
${report.files?.map(f => `- ${f.name}`).join('\n') || '- No specific files'}
`;
    fs.writeFileSync(mdPath, mdContent.trim());

    // 3. Generate HTML
    const htmlContent = `
<!DOCTYPE html>
<html>
<head><title>Code Review Report</title></head>
<body style="font-family: sans-serif; padding: 20px;">
    <h1>Pull Request Code Review</h1>
    <p><strong>Summary:</strong> ${report.summary}</p>
    <p><strong>Total Score:</strong> ${report.totalScore}/100</p>
</body>
</html>
`;
    fs.writeFileSync(htmlPath, htmlContent.trim());
  }
}
