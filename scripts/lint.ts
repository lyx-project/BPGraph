import { exec } from 'child_process';
import { readdirSync, statSync,existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const packagesDir = join(currentDir, "..", "packages");
const packages = readdirSync(packagesDir)
  .filter(name => {
    const pkgDir = join(packagesDir, name);
    return statSync(pkgDir).isDirectory() && existsSync(join(pkgDir, "package.json"));
  })
  .map(name => {
    const pkgDir = join(packagesDir, name);
    const pkgJson = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));
    return pkgJson.name;
  });

async function runLint(pkg: string) {
  return new Promise<void>(resolve => {
    exec(
      `pnpm --filter ${pkg} lint`,
      (error, stdout, stderr) => {
        console.log(`\n 📦 [${pkg}] Linting...`);
        process.stdout.write(stdout);
        process.stderr.write(stderr);
        if (error?.code !== undefined && error.code !== 0) {
          console.error(`❌ [${pkg}] Lint failed with code ${error.code}`);
        }
        resolve();
      }
    );
  });
}

async function runLints() {
  await Promise.all(packages.map(runLint))
}

runLints().catch(err => {
  console.error(err);
  process.exit(1);
});