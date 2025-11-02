import { fileURLToPath } from "url";
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

const currentDir = dirname(fileURLToPath(import.meta.url));
const packagesDir = join(currentDir, "..", "packages");

const packageDirs = readdirSync(packagesDir)
  .filter(name => {
    const pkgDir = join(packagesDir, name);
    return statSync(pkgDir).isDirectory() && existsSync(join(pkgDir, "package.json"));
  })
  .map(name => {
    const pkgDir = join(packagesDir, name);
    return pkgDir;
  });

const rootPkg = JSON.parse(readFileSync("package.json", "utf-8"));
const version = rootPkg.version;

packageDirs.forEach((dir) => {
  const pkgPath = resolve(`${dir}/package.json`);
  const pkgJson = JSON.parse(readFileSync(pkgPath, "utf-8"));
  pkgJson.version = version;
  writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2));
  console.log(`🔄 [${dir}] Syncing version to ${version}`);
});
