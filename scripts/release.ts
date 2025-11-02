import { execSync } from "node:child_process";

try {
  // 1. Lint & Test
  execSync("pnpm lint && pnpm test", { stdio: "inherit" });

  // 2. Version bump (interactive)
  execSync("pnpm changeset version", { stdio: "inherit" });

  // Sync versions across packages
  execSync("pnpm sync-versions", { stdio: "inherit" });

  // Optional: commit version changes
  execSync('git add . && git commit -m "chore: bump versions [skip ci]"', { stdio: "inherit" });

  // 3. Build all packages
  execSync("pnpm build", { stdio: "inherit" });

  // 4. Publish to npm (recursive for all packages)
  execSync("pnpm publish -r --access public --registry https://registry.npmjs.org/", { stdio: "inherit" });

  // Optional: create git tag & push
  execSync("git push --follow-tags", { stdio: "inherit" });

  console.log("✅ Release completed");
} catch (e) {
  console.error("❌ Release failed:", e);
}