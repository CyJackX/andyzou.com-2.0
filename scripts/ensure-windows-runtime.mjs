#!/usr/bin/env node

const isWindows = process.platform === "win32";
const isCiEnvironment =
  process.env.CI === "true" ||
  process.env.CF_PAGES === "1" ||
  process.env.GITHUB_ACTIONS === "true" ||
  process.env.BUILD_ID ||
  process.env.WORKERS_CI;
const isRepoOnWindowsMount =
  process.cwd().startsWith("/mnt/") || process.cwd().startsWith("/media/");

if (isWindows || isCiEnvironment || !isRepoOnWindowsMount) {
  process.exit(0);
}

const message = [
  "",
  "This repo must be run from native Windows Node/npm, not from WSL/Linux.",
  "",
  "Why:",
  "The project lives on G:, and the Windows workflow is the intended setup here.",
  "Running npm from WSL against /mnt/g slows file watching and can mix native dependencies.",
  "",
  "Do this instead:",
  "1. Open a Windows terminal.",
  "2. cd /d G:\\Projects\\astro-blog-starter-andyzou",
  "3. Run npm install, npm run dev, npm run build from there.",
  "",
].join("\n");

console.error(message);
process.exit(1);
