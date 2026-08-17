#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_WORKSPACE = path.resolve(SCRIPT_DIR, "../../../..");
const MAX_BUFFER = 64 * 1024 * 1024;

const DIRECTORY_RULES = new Map([
  [".next", ["build-cache", "Next.js build cache"]],
  [".turbo", ["build-cache", "Turborepo cache"]],
  [".cache", ["build-cache", "tool build cache"]],
  [".vite", ["build-cache", "Vite cache"]],
  [".vinext", ["build-cache", "Vinext cache"]],
  [".parcel-cache", ["build-cache", "Parcel cache"]],
  [".svelte-kit", ["build-cache", "SvelteKit build output"]],
  [".nuxt", ["build-cache", "Nuxt build output"]],
  [".output", ["build-output", "generated build output"]],
  ["dist", ["build-output", "generated distribution output"]],
  ["build", ["build-output", "generated build output"]],
  ["out", ["build-output", "generated export output"]],
  ["target", ["build-output", "compiled target output"]],
  ["storybook-static", ["build-output", "Storybook static output"]],
  ["coverage", ["test-output", "test coverage output"]],
  [".nyc_output", ["test-output", "NYC coverage cache"]],
  ["test-results", ["test-output", "test result output"]],
  ["playwright-report", ["test-output", "Playwright report"]],
  ["blob-report", ["test-output", "Playwright blob report"]],
  [".pytest_cache", ["test-output", "pytest cache"]],
  [".mypy_cache", ["build-cache", "mypy cache"]],
  [".ruff_cache", ["build-cache", "Ruff cache"]],
  ["__pycache__", ["build-cache", "Python bytecode cache"]],
  ["debug_translations", ["temporary", "translation debug output"]],
]);

const DEPENDENCY_DIRECTORIES = new Set([
  "node_modules",
  ".pnpm-store",
  ".venv",
  "venv",
]);

const DIRECT_CANDIDATES = [
  ...DIRECTORY_RULES.keys(),
  ...DEPENDENCY_DIRECTORIES,
  ".vercel/output",
  "node_modules/.cache",
  ".eslintcache",
  "tsconfig.tsbuildinfo",
];

const PROTECTED_SEGMENTS = new Set([
  "comic-delivery-evidence",
  "delivery-evidence",
  "evidence",
  "run-manifests",
  "output",
  "outputs",
  "_reports",
  "reports",
  "tmp",
]);

function printHelp() {
  process.stdout.write(`LlamaGen untracked temporary-file auditor and cleaner

Usage:
  node .codex/skills/maintain-llamagen/scripts/workspace-temp-cleanup.mjs [options]

Safe defaults:
  - Without --apply, this command only reports disk usage.
  - Only allowlisted, fully untracked cache/build/test paths can be removed.
  - Evidence, reports, .env files, and ordinary untracked source files are never removed.
  - Dependency directories require both --apply and --include-dependencies.

Options:
  --workspace <path>          Workspace root (default: inferred umbrella root)
  --repo <path>               Limit scanning to a repository or subproject; repeatable
  --apply                     Remove eligible paths after re-validating safety checks
  --include-dependencies      Include node_modules, .venv, and local package stores
  --older-than-days <number>  Only select paths whose own mtime is this old (default: 0)
  --top <number>              Maximum candidate rows in human output (default: 40)
  --json                      Emit machine-readable JSON
  --help                      Show this help

Examples:
  node .codex/skills/maintain-llamagen/scripts/workspace-temp-cleanup.mjs
  node .codex/skills/maintain-llamagen/scripts/workspace-temp-cleanup.mjs --repo llamagen.ai
  node .codex/skills/maintain-llamagen/scripts/workspace-temp-cleanup.mjs --older-than-days 7 --apply
  node .codex/skills/maintain-llamagen/scripts/workspace-temp-cleanup.mjs --include-dependencies --apply
`);
}

function parseArgs(argv) {
  const options = {
    workspace: DEFAULT_WORKSPACE,
    repos: [],
    apply: false,
    includeDependencies: false,
    olderThanDays: 0,
    top: 40,
    json: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--apply") {
      options.apply = true;
    } else if (argument === "--include-dependencies") {
      options.includeDependencies = true;
    } else if (argument === "--json") {
      options.json = true;
    } else if (argument === "--help" || argument === "-h") {
      options.help = true;
    } else if (["--workspace", "--repo", "--older-than-days", "--top"].includes(argument)) {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`${argument} requires a value`);
      }
      index += 1;
      if (argument === "--workspace") options.workspace = value;
      if (argument === "--repo") options.repos.push(value);
      if (argument === "--older-than-days") options.olderThanDays = Number(value);
      if (argument === "--top") options.top = Number(value);
    } else {
      throw new Error(`Unknown option: ${argument}`);
    }
  }

  if (!Number.isFinite(options.olderThanDays) || options.olderThanDays < 0) {
    throw new Error("--older-than-days must be a non-negative number");
  }
  if (!Number.isInteger(options.top) || options.top < 1) {
    throw new Error("--top must be a positive integer");
  }

  options.workspace = path.resolve(options.workspace);
  return options;
}

function runGit(cwd, args, { allowFailure = false } = {}) {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    maxBuffer: MAX_BUFFER,
  });
  if (result.error) throw result.error;
  if (result.status !== 0 && !allowFailure) {
    const detail = result.stderr.trim() || result.stdout.trim() || `exit ${result.status}`;
    throw new Error(`git ${args.join(" ")} failed in ${cwd}: ${detail}`);
  }
  return result;
}

function canonicalExistingPath(target) {
  return fs.realpathSync(path.resolve(target));
}

function isWithin(parent, child) {
  const relative = path.relative(parent, child);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== "..");
}

function isInsideNestedRepository(scopeRepoRoot, target, repositoryRoots) {
  return repositoryRoots.some(
    (repoRoot) =>
      repoRoot !== scopeRepoRoot &&
      isWithin(scopeRepoRoot, repoRoot) &&
      (target === repoRoot || isWithin(repoRoot, target)),
  );
}

function toPosix(relativePath) {
  return relativePath.split(path.sep).join("/");
}

function relativeDisplay(workspace, absolutePath) {
  const relative = path.relative(workspace, absolutePath);
  return relative === "" ? "." : toPosix(relative);
}

function repositoryTop(target) {
  const result = runGit(target, ["rev-parse", "--show-toplevel"], { allowFailure: true });
  if (result.status !== 0) return null;
  return canonicalExistingPath(result.stdout.trim());
}

function discoverRepositoryRoots(workspace) {
  const roots = new Set();
  const workspaceTop = repositoryTop(workspace);
  if (workspaceTop) roots.add(workspaceTop);

  for (const entry of fs.readdirSync(workspace, { withFileTypes: true })) {
    if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
    const candidate = path.join(workspace, entry.name);
    let stat;
    try {
      stat = fs.lstatSync(path.join(candidate, ".git"));
    } catch {
      continue;
    }
    if (!stat.isDirectory() && !stat.isFile()) continue;
    const top = repositoryTop(candidate);
    if (top && isWithin(workspace, top)) roots.add(top);
  }

  return [...roots].sort((left, right) => left.localeCompare(right));
}

function buildScopes(options, repositoryRoots) {
  if (options.repos.length === 0) {
    return repositoryRoots.map((repoRoot) => ({ repoRoot, scanRoot: repoRoot }));
  }

  const scopes = [];
  for (const requested of options.repos) {
    const scanRoot = canonicalExistingPath(
      path.isAbsolute(requested) ? requested : path.join(options.workspace, requested),
    );
    if (!isWithin(options.workspace, scanRoot)) {
      throw new Error(`Refusing --repo outside workspace: ${requested}`);
    }
    const repoRoot = repositoryTop(scanRoot);
    if (!repoRoot || !isWithin(options.workspace, repoRoot)) {
      throw new Error(`Not inside a workspace Git repository: ${requested}`);
    }
    scopes.push({ repoRoot, scanRoot });
  }

  return scopes.filter(
    (scope, index, all) =>
      all.findIndex(
        (item) => item.repoRoot === scope.repoRoot && item.scanRoot === scope.scanRoot,
      ) === index,
  );
}

function parseGitStatus(repoRoot) {
  const result = runGit(repoRoot, [
    "status",
    "--porcelain=v1",
    "-z",
    "--untracked-files=normal",
    "--ignored=matching",
  ]);
  const entries = [];
  for (const token of result.stdout.split("\0")) {
    if (!token) continue;
    const status = token.slice(0, 2);
    if (status !== "??" && status !== "!!") continue;
    const relativePath = token.slice(3).replace(/\/$/, "");
    if (relativePath) entries.push({ status, relativePath });
  }
  return entries;
}

function trackedEntries(repoRoot, absolutePath) {
  const relative = toPosix(path.relative(repoRoot, absolutePath));
  const result = runGit(repoRoot, ["ls-files", "-z", "--", relative]);
  return result.stdout.split("\0").filter(Boolean);
}

function isIgnored(repoRoot, absolutePath) {
  const relative = toPosix(path.relative(repoRoot, absolutePath));
  const result = runGit(repoRoot, ["check-ignore", "-q", "--", relative], {
    allowFailure: true,
  });
  return result.status === 0;
}

function isProtected(relativePath) {
  const normalized = toPosix(relativePath).replace(/^\.\//, "");
  const segments = normalized.split("/").filter(Boolean);
  const basename = segments.at(-1) || "";
  if (segments.includes(".git")) return ".git metadata";
  if (basename === ".env" || basename.startsWith(".env.")) return "environment file";
  if (segments.some((segment) => PROTECTED_SEGMENTS.has(segment))) {
    return "delivery evidence or run manifest";
  }
  return null;
}

function mayClassifyFromGitStatus(stat, relativePath, gitStatus) {
  if (gitStatus === "!!") return true;
  if (!stat.isDirectory()) {
    const basename = path.posix.basename(toPosix(relativePath));
    return (
      basename === ".DS_Store" ||
      basename === ".eslintcache" ||
      basename.endsWith(".tsbuildinfo") ||
      /^(npm|yarn|pnpm)-(debug|error)\.log(?:\.\d+)?$/.test(basename)
    );
  }
  return false;
}

function classifyCandidate(relativePath, isDirectory) {
  const normalized = toPosix(relativePath).replace(/\/$/, "");
  const segments = normalized.split("/").filter(Boolean);
  const basename = segments.at(-1) || "";

  if (isDirectory && DEPENDENCY_DIRECTORIES.has(basename)) {
    return { category: "dependencies", reason: "reinstallable dependencies", optIn: true };
  }
  if (isDirectory && DIRECTORY_RULES.has(basename)) {
    const [category, reason] = DIRECTORY_RULES.get(basename);
    return { category, reason, optIn: false };
  }
  if (isDirectory && basename.startsWith(".next-")) {
    return { category: "build-cache", reason: "Next.js temporary build cache", optIn: false };
  }
  if (isDirectory && segments.slice(-2).join("/") === ".vercel/output") {
    return { category: "build-output", reason: "Vercel generated output", optIn: false };
  }
  if (isDirectory) return null;

  if (basename === ".DS_Store") {
    return { category: "temporary", reason: "macOS metadata", optIn: false };
  }
  if (basename === ".eslintcache") {
    return { category: "build-cache", reason: "ESLint cache", optIn: false };
  }
  if (basename.endsWith(".tsbuildinfo")) {
    return { category: "build-cache", reason: "TypeScript incremental cache", optIn: false };
  }
  if (/^(npm|yarn|pnpm)-(debug|error)\.log(?:\.\d+)?$/.test(basename)) {
    return { category: "temporary", reason: "package-manager debug log", optIn: false };
  }
  if (
    basename.endsWith(".tmp") ||
    basename.endsWith(".temp") ||
    basename.endsWith(".swp") ||
    basename.endsWith(".swo") ||
    basename.endsWith("~")
  ) {
    return { category: "temporary", reason: "temporary editor/tool file", optIn: false };
  }
  return null;
}

function packageRootsForScope(scope, allRepositoryRoots) {
  const roots = new Set([scope.scanRoot]);
  const scanPrefix = toPosix(path.relative(scope.repoRoot, scope.scanRoot));
  const packageResult = runGit(scope.repoRoot, [
    "ls-files",
    "-z",
    "--",
    "package.json",
    ":(glob)**/package.json",
  ]);

  for (const relativePackage of packageResult.stdout.split("\0").filter(Boolean)) {
    const absolutePackage = path.join(scope.repoRoot, relativePackage);
    if (!isWithin(scope.scanRoot, absolutePackage)) continue;
    if (isInsideNestedRepository(scope.repoRoot, absolutePackage, allRepositoryRoots)) {
      continue;
    }
    roots.add(path.dirname(absolutePackage));
  }

  // Include first-level ignored prototypes such as waiting-animation, whose
  // package.json is intentionally invisible to the umbrella repository index.
  for (const entry of fs.readdirSync(scope.scanRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const child = path.join(scope.scanRoot, entry.name);
    if (isInsideNestedRepository(scope.repoRoot, child, allRepositoryRoots)) {
      continue;
    }
    if (fs.existsSync(path.join(child, "package.json"))) roots.add(child);
  }

  if (scanPrefix && scanPrefix.startsWith("..")) {
    throw new Error(`Invalid scan scope outside repository: ${scope.scanRoot}`);
  }
  return [...roots];
}

function directCandidates(packageRoot) {
  const candidates = new Set();
  for (const relative of DIRECT_CANDIDATES) {
    const absolute = path.join(packageRoot, relative);
    if (fs.existsSync(absolute)) candidates.add(absolute);
  }
  try {
    for (const entry of fs.readdirSync(packageRoot, { withFileTypes: true })) {
      if (entry.name.startsWith(".next-") && entry.isDirectory()) {
        candidates.add(path.join(packageRoot, entry.name));
      }
    }
  } catch {
    // A package root may disappear between discovery and audit.
  }
  return [...candidates];
}

function pathDiskUsage(absolutePath) {
  const result = spawnSync("du", ["-sk", absolutePath], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024,
  });
  if (!result.error && result.status === 0) {
    const kibibytes = Number.parseInt(result.stdout.trim().split(/\s+/)[0], 10);
    if (Number.isFinite(kibibytes)) return kibibytes * 1024;
  }
  const stat = fs.lstatSync(absolutePath);
  return stat.isDirectory() ? 0 : stat.size;
}

function audit(options) {
  const workspace = canonicalExistingPath(options.workspace);
  const repositoryRoots = discoverRepositoryRoots(workspace);
  const scopes = buildScopes({ ...options, workspace }, repositoryRoots);
  const candidateMap = new Map();
  const protectedMap = new Map();
  const unclassifiedMap = new Map();
  const trackedTempMap = new Map();

  const addStatusPath = (scope, statusEntry) => {
    const absolutePath = path.join(scope.repoRoot, statusEntry.relativePath);
    if (!isWithin(scope.scanRoot, absolutePath)) return;
    if (isInsideNestedRepository(scope.repoRoot, absolutePath, repositoryRoots)) {
      return;
    }
    const displayPath = relativeDisplay(workspace, absolutePath);
    const protection = isProtected(displayPath);
    if (protection) {
      protectedMap.set(absolutePath, { path: displayPath, reason: protection });
      return;
    }
    let stat;
    try {
      stat = fs.lstatSync(absolutePath);
    } catch {
      return;
    }
    const classification = mayClassifyFromGitStatus(stat, displayPath, statusEntry.status)
      ? classifyCandidate(displayPath, stat.isDirectory())
      : null;
    if (!classification) {
      unclassifiedMap.set(absolutePath, { path: displayPath, gitStatus: statusEntry.status });
      return;
    }
    candidateMap.set(absolutePath, {
      absolutePath,
      repoRoot: scope.repoRoot,
      path: displayPath,
      gitStatus: statusEntry.status,
      source: "git-status",
      ...classification,
    });
  };

  for (const scope of scopes) {
    for (const entry of parseGitStatus(scope.repoRoot)) addStatusPath(scope, entry);
    for (const packageRoot of packageRootsForScope(scope, repositoryRoots)) {
      for (const absolutePath of directCandidates(packageRoot)) {
        if (!isWithin(scope.scanRoot, absolutePath)) continue;
        const displayPath = relativeDisplay(workspace, absolutePath);
        const protection = isProtected(displayPath);
        if (protection) {
          protectedMap.set(absolutePath, { path: displayPath, reason: protection });
          continue;
        }
        const stat = fs.lstatSync(absolutePath);
        const classification = classifyCandidate(displayPath, stat.isDirectory());
        if (!classification) continue;
        const tracked = trackedEntries(scope.repoRoot, absolutePath);
        if (tracked.length > 0) {
          trackedTempMap.set(absolutePath, {
            path: displayPath,
            reason: `contains ${tracked.length} tracked entr${tracked.length === 1 ? "y" : "ies"}`,
          });
          candidateMap.delete(absolutePath);
          continue;
        }
        if (stat.isDirectory() && !isIgnored(scope.repoRoot, absolutePath)) {
          unclassifiedMap.set(absolutePath, {
            path: displayPath,
            gitStatus: "untracked-directory-not-ignored",
          });
          candidateMap.delete(absolutePath);
          continue;
        }
        candidateMap.set(absolutePath, {
          absolutePath,
          repoRoot: scope.repoRoot,
          path: displayPath,
          gitStatus: "untracked",
          source: "known-path",
          ...classification,
        });
      }
    }
  }

  const now = Date.now();
  const candidates = [...candidateMap.values()]
    .map((candidate) => {
      const stat = fs.lstatSync(candidate.absolutePath);
      const ageDays = Math.max(0, (now - stat.mtimeMs) / 86_400_000);
      return {
        ...candidate,
        bytes: pathDiskUsage(candidate.absolutePath),
        ageDays,
        kind: stat.isSymbolicLink() ? "symlink" : stat.isDirectory() ? "directory" : "file",
      };
    })
    .sort((left, right) => right.bytes - left.bytes);

  const eligible = candidates.filter(
    (candidate) =>
      candidate.ageDays >= options.olderThanDays &&
      (!candidate.optIn || options.includeDependencies),
  );
  const selected = [];
  for (const candidate of [...eligible].sort((left, right) => left.path.length - right.path.length)) {
    const covered = selected.some((parent) => isWithin(parent.absolutePath, candidate.absolutePath));
    if (!covered) selected.push(candidate);
  }
  selected.sort((left, right) => right.bytes - left.bytes);

  return {
    workspace,
    repositoryRoots,
    scopes,
    candidates,
    selected,
    protected: [...protectedMap.values()].sort((a, b) => a.path.localeCompare(b.path)),
    unclassified: [...unclassifiedMap.values()].sort((a, b) => a.path.localeCompare(b.path)),
    trackedTemp: [...trackedTempMap.values()].sort((a, b) => a.path.localeCompare(b.path)),
  };
}

function validateBeforeDelete(candidate, workspace) {
  let stat;
  try {
    stat = fs.lstatSync(candidate.absolutePath);
  } catch {
    return "path disappeared before deletion";
  }
  if (stat.isSymbolicLink()) return "symbolic links are report-only";
  let resolvedCandidate;
  try {
    resolvedCandidate = fs.realpathSync(candidate.absolutePath);
  } catch {
    return "path could not be resolved before deletion";
  }
  if (resolvedCandidate !== candidate.absolutePath) {
    return "resolved path changed after audit";
  }
  if (!isWithin(workspace, resolvedCandidate) || resolvedCandidate === workspace) {
    return "path is outside the workspace or is the workspace root";
  }
  if (!isWithin(candidate.repoRoot, resolvedCandidate) || resolvedCandidate === candidate.repoRoot) {
    return "path is outside its Git worktree or is the repository root";
  }
  const protection = isProtected(relativeDisplay(workspace, resolvedCandidate));
  if (protection) return `protected: ${protection}`;
  if (fs.existsSync(path.join(resolvedCandidate, ".git"))) {
    return "candidate contains Git metadata at its root";
  }
  const tracked = trackedEntries(candidate.repoRoot, resolvedCandidate);
  if (tracked.length > 0) return `candidate now contains ${tracked.length} tracked entries`;
  if (!classifyCandidate(candidate.path, stat.isDirectory())) return "path no longer matches an allowlisted type";
  return null;
}

function applyCleanup(report) {
  const deleted = [];
  const failures = [];
  for (const candidate of report.selected) {
    const safetyFailure = validateBeforeDelete(candidate, report.workspace);
    if (safetyFailure) {
      failures.push({ path: candidate.path, error: safetyFailure });
      continue;
    }
    try {
      fs.rmSync(candidate.absolutePath, { recursive: true, force: false, maxRetries: 2 });
      deleted.push({ path: candidate.path, bytes: candidate.bytes, category: candidate.category });
    } catch (error) {
      failures.push({ path: candidate.path, error: error.message });
    }
  }
  return { deleted, failures };
}

function sumBytes(items) {
  return items.reduce((total, item) => total + item.bytes, 0);
}

function formatBytes(bytes) {
  const units = ["B", "KiB", "MiB", "GiB", "TiB"];
  let value = bytes;
  let unit = units[0];
  for (let index = 1; index < units.length && value >= 1024; index += 1) {
    value /= 1024;
    unit = units[index];
  }
  return `${value >= 10 || unit === "B" ? value.toFixed(0) : value.toFixed(1)} ${unit}`;
}

function jsonReport(options, report, cleanup) {
  const selectedPaths = new Set(report.selected.map((candidate) => candidate.absolutePath));
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    mode: options.apply ? "apply" : "dry-run",
    workspace: report.workspace,
    options: {
      includeDependencies: options.includeDependencies,
      olderThanDays: options.olderThanDays,
      repos: options.repos,
    },
    summary: {
      repositories: report.repositoryRoots.length,
      candidates: report.candidates.length,
      selected: report.selected.length,
      selectedBytes: sumBytes(report.selected),
      protected: report.protected.length,
      unclassified: report.unclassified.length,
      trackedTempLike: report.trackedTemp.length,
      deleted: cleanup?.deleted.length || 0,
      deletedBytes: sumBytes(cleanup?.deleted || []),
      failures: cleanup?.failures.length || 0,
    },
    candidates: report.candidates.map(({ absolutePath, repoRoot, ...candidate }) => ({
      ...candidate,
      selected: selectedPaths.has(absolutePath),
    })),
    protected: report.protected,
    unclassified: report.unclassified,
    trackedTempLike: report.trackedTemp,
    cleanup,
  };
}

function printHuman(options, report, cleanup) {
  const mode = options.apply ? "APPLY" : "DRY RUN";
  process.stdout.write(`LlamaGen untracked temporary-file audit (${mode})\n`);
  process.stdout.write(`Workspace: ${report.workspace}\n`);
  process.stdout.write(`Git repositories discovered: ${report.repositoryRoots.length}\n\n`);

  if (report.candidates.length === 0) {
    process.stdout.write("No allowlisted untracked temporary paths found.\n");
  } else {
    process.stdout.write("SIZE       CATEGORY       AGE      SELECTED  PATH\n");
    process.stdout.write("---------- ------------- --------- --------- ----\n");
    const selectedPaths = new Set(report.selected.map((candidate) => candidate.absolutePath));
    for (const candidate of report.candidates.slice(0, options.top)) {
      const selected = selectedPaths.has(candidate.absolutePath) ? "yes" : candidate.optIn ? "opt-in" : "no";
      process.stdout.write(
        `${formatBytes(candidate.bytes).padEnd(10)} ${candidate.category.padEnd(13)} ${(candidate.ageDays.toFixed(1) + "d").padEnd(9)} ${selected.padEnd(9)} ${candidate.path}\n`,
      );
    }
    if (report.candidates.length > options.top) {
      process.stdout.write(`... ${report.candidates.length - options.top} more candidate paths (use --top to expand)\n`);
    }
  }

  const dependencyCandidates = report.candidates.filter((candidate) => candidate.optIn);
  process.stdout.write(`\nSelected reclaimable space: ${formatBytes(sumBytes(report.selected))} across ${report.selected.length} paths\n`);
  if (!options.includeDependencies && dependencyCandidates.length > 0) {
    process.stdout.write(
      `Optional dependency space: ${formatBytes(sumBytes(dependencyCandidates))} across ${dependencyCandidates.length} paths (requires --include-dependencies)\n`,
    );
  }
  process.stdout.write(
    `Never removed: ${report.protected.length} protected, ${report.unclassified.length} ordinary/unclassified untracked, ${report.trackedTemp.length} temp-like paths containing tracked files\n`,
  );

  if (!options.apply) {
    process.stdout.write("\nNo files were deleted. Review the list, then add --apply to remove only SELECTED paths.\n");
  } else {
    process.stdout.write(
      `\nDeleted: ${cleanup.deleted.length} paths, ${formatBytes(sumBytes(cleanup.deleted))} reclaimed.\n`,
    );
    for (const failure of cleanup.failures) {
      process.stdout.write(`FAILED ${failure.path}: ${failure.error}\n`);
    }
  }
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
    if (options.help) {
      printHelp();
      return;
    }
    const report = audit(options);
    const cleanup = options.apply ? applyCleanup(report) : null;
    if (options.json) {
      process.stdout.write(`${JSON.stringify(jsonReport(options, report, cleanup), null, 2)}\n`);
    } else {
      printHuman(options, report, cleanup);
    }
    if (cleanup?.failures.length) process.exitCode = 1;
  } catch (error) {
    process.stderr.write(`workspace-temp-cleanup: ${error.message}\n`);
    process.exitCode = 1;
  }
}

main();
