// scripts/test-url.ts

import { buildRedirectParams } from "@/lib/token";

async function main() {
  const { ref, sig } = await buildRedirectParams(
    "test@gmail.com",
    "7616920268",
  );

  console.log(`http://localhost:3001/deposit?ref=${ref}&sig=${sig}`);
}

main();
