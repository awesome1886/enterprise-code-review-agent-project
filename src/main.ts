import { Orchestrator } from './orchestrator.js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const args = process.argv.slice(2);
  const [owner, repo, prNumberStr] = args;
  
  if (!owner || !repo || !prNumberStr) {
      console.error("Usage: npm run dev -- <owner> <repo> <pr_number>");
      process.exit(1);
  }

  const prNumber = parseInt(prNumberStr, 10);

  try {
    const orchestrator = new Orchestrator();
    // 1. Run the Review (or get the Backup)
    const reviewReport = await orchestrator.reviewPullRequest(owner, repo, prNumber);

    // 2. Define Output Paths
    const reportDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir);

    const baseFilename = `${owner}_${repo}_${prNumber}`;
    const jsonPath = path.join(reportDir, `${baseFilename}.json`);
    const mdPath = path.join(reportDir, `${baseFilename}.md`);
    const htmlPath = path.join(reportDir, `${baseFilename}.html`);

    // 3. SAVE JSON
    fs.writeFileSync(jsonPath, JSON.stringify(reviewReport, null, 2));
    console.log(`\n✅ JSON Report saved: ${jsonPath}`);

    // 4. SAVE MARKDOWN
    const mdContent = `# Code Review for PR #${prNumber}\n\n## Summary\n${reviewReport.summary}\n\n## Score: ${reviewReport.totalScore}/100`;
    fs.writeFileSync(mdPath, mdContent);
    console.log(`✅ Markdown Report saved: ${mdPath}`);

    // 5. SAVE HTML
    const htmlContent = `<html><body><h1>PR #${prNumber} Review</h1><p>${reviewReport.summary}</p><h2>Score: ${reviewReport.totalScore}</h2></body></html>`;
    fs.writeFileSync(htmlPath, htmlContent);
    console.log(`✅ HTML Report saved: ${htmlPath}`);

    console.log("\n🎉 SUCCESS! You can now submit the files in the 'reports' folder.");

  } catch (error) {
    console.error('Fatal Error:', error);
  }
}

main();
