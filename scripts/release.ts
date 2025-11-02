import { execSync } from "node:child_process";

try {
  // 1. Run lint & test
  execSync("pnpm lint && pnpm test", { stdio: "inherit" });

  // 2. Bump version (interactive selection: patch/minor/major)
  execSync("pnpm changeset version", { stdio: "inherit" });

  // 3. Build
  execSync("pnpm build", { stdio: "inherit" });

  // 4. Publish to npm
  execSync("pnpm publish -r --access public", { stdio: "inherit" });

  console.log("✅ Release completed");
} catch (e) {
  console.error("❌ Release failed:", e);
}