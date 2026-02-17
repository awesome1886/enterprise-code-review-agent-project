cat <<EOF > src/debug-connection.ts
import 'dotenv/config';
import { query } from '@anthropic-ai/claude-agent-sdk';

async function testConnection() {
  console.log("1. Checking Environment...");
  const apiKey = process.env.ANTHROPIC_API_KEY;
  console.log("- Model:", process.env.ANTHROPIC_MODEL);
  console.log("- API Key Present:", !!apiKey);
  if (apiKey) console.log("- API Key Length:", apiKey.length);

  console.log("\n2. Sending simple request to Claude via 'query'...");
  try {
    const stream = query({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929',
      prompt: "Reply with exactly the word: 'Success'",
    });
    
    console.log("\n3. Stream started. Waiting for response...");
    
    let fullText = "";
    for await (const message of stream) {
      if (message.type === 'text') {
        process.stdout.write(message.content); // Print chunk
        fullText += message.content;
      }
    }
    
    console.log("\n\n4. Final Result:");
    if (fullText.includes("Success")) {
      console.log("✅ CONNECTION WORKING!");
    } else {
      console.log("⚠️ RECEIVED UNEXPECTED RESPONSE: " + fullText);
    }
  } catch (error) {
    console.error("\n❌ CONNECTION FAILED:");
    console.error(error);
  }
}

testConnection();
EOF
