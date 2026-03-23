import { Orchestrator } from './orchestrator.js';
import { ReportGenerator } from './utils/report-generator.js'; // Use the required class
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  // --- 1. VALIDATE ENVIRONMENT VARIABLES ---
  if (!process.env.ANTHROPIC_API_KEY && (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY)) {
    console.error("❌ Error: Missing authentication credentials. Please set ANTHROPIC_API_KEY in your .env file.");
    process.exit(1);
  }
  if (!process.env.GITHUB_TOKEN) {
    console.warn("⚠️ Warning: GITHUB_TOKEN is not set. You may hit rate limits.");
  }

  // --- 2. VALIDATE CLI ARGUMENTS ---
  const args = process.argv.slice(2);
  const [owner, repo, prNumberStr] = args;

  if (!owner || !repo || !prNumberStr) {
    console.error("Usage: npm run dev -- <owner> <repo> <pr_number>");
    process.exit(1);
  }

  const prNumber = parseInt(prNumberStr, 10);
  
  // REQUIRED: isNaN and positive integer check
  if (isNaN(prNumber) || prNumber <= 0) {
    console.error("❌ Error: PR number must be a valid positive integer.");
    process.exit(1);
  }

  // --- 3. RUN REVIEW AND GENERATE REPORTS ---
  try {
    const orchestrator = new Orchestrator();
    
    // 1. Run the Review
    const reviewReport = await orchestrator.reviewPullRequest(owner, repo, prNumber);

    // 2. Use ReportGenerator (Replaces manual fs.writeFileSync and inline templates)
    const generator = new ReportGenerator();
    const baseFilename = `${owner}_${repo}_${prNumber}`;
    
    await generator.generateAll(reviewReport, baseFilename);

    console.log(`\n✅ SUCCESS! Reports saved in the 'reports' folder.`);
    
  } catch (error: any) {
    // REQUIRED: User-friendly error message, no raw stack traces
    console.error('\n❌ Fatal Error:', error.message || "An unexpected error occurred");
    process.exit(1);
  }
}

main();