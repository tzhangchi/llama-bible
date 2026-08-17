import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), "workspace-temp-cleanup.mjs");

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed: ${result.stderr || result.stdout}`);
  }
  return result;
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "llamagen-temp-cleanup-"));
  run("git", ["init", "-q"], root);
  run("git", ["config", "user.email", "cleanup-test@invalid.example"], root);
  run("git", ["config", "user.name", "Cleanup Test"], root);
  fs.writeFileSync(
    path.join(root, ".gitignore"),
    ".next/\nnode_modules/\ncoverage/\ntmp/\n*.tsbuildinfo\n",
  );
  fs.writeFileSync(path.join(root, "package.json"), '{"private":true}\n');
  fs.mkdirSync(path.join(root, "src"));
  fs.writeFileSync(path.join(root, "src", "tracked.js"), "export {};\n");
  run("git", ["add", ".gitignore", "package.json", "src/tracked.js"], root);
  run("git", ["commit", "-qm", "fixture"], root);
  return root;
}

function execute(root, extraArgs = []) {
  const result = spawnSync(
    process.execPath,
    [SCRIPT, "--workspace", root, "--json", ...extraArgs],
    { cwd: root, encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test("dry-run reports safe caches but preserves evidence and ordinary untracked files", (context) => {
  const root = fixture();
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));

  fs.mkdirSync(path.join(root, ".next"));
  fs.writeFileSync(path.join(root, ".next", "cache.bin"), Buffer.alloc(2048));
  fs.mkdirSync(path.join(root, "coverage"));
  fs.writeFileSync(path.join(root, "coverage", "coverage.json"), "{}\n");
  fs.mkdirSync(path.join(root, "tmp", "comic-delivery-evidence"), { recursive: true });
  fs.writeFileSync(path.join(root, "tmp", "comic-delivery-evidence", "page.png"), "retain\n");
  fs.writeFileSync(path.join(root, "src", "new-user-file.js"), "do not delete\n");
  fs.writeFileSync(path.join(root, "src", "draft.tmp"), "also do not delete\n");

  const report = execute(root);
  assert.equal(report.mode, "dry-run");
  assert.ok(report.candidates.some((candidate) => candidate.path === ".next" && candidate.selected));
  assert.ok(report.candidates.some((candidate) => candidate.path === "coverage" && candidate.selected));
  assert.ok(report.protected.some((entry) => entry.path === "tmp"));
  assert.ok(report.unclassified.some((entry) => entry.path === "src/new-user-file.js"));
  assert.ok(report.unclassified.some((entry) => entry.path === "src/draft.tmp"));
  assert.equal(fs.existsSync(path.join(root, ".next", "cache.bin")), true);
});

test("apply deletes allowlisted outputs but dependencies remain opt-in", (context) => {
  const root = fixture();
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));

  fs.mkdirSync(path.join(root, ".next"));
  fs.writeFileSync(path.join(root, ".next", "cache.bin"), "cache\n");
  fs.mkdirSync(path.join(root, "node_modules", "pkg"), { recursive: true });
  fs.writeFileSync(path.join(root, "node_modules", "pkg", "index.js"), "dependency\n");

  const report = execute(root, ["--apply"]);
  assert.equal(report.summary.failures, 0);
  assert.equal(fs.existsSync(path.join(root, ".next")), false);
  assert.equal(fs.existsSync(path.join(root, "node_modules")), true);
  assert.ok(report.candidates.some((candidate) => candidate.path === "node_modules" && !candidate.selected));

  const dependencyReport = execute(root, ["--apply", "--include-dependencies"]);
  assert.equal(dependencyReport.summary.failures, 0);
  assert.equal(fs.existsSync(path.join(root, "node_modules")), false);
});

test("a temp-like directory containing a tracked file is never removed", (context) => {
  const root = fixture();
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));

  fs.mkdirSync(path.join(root, "build"));
  fs.writeFileSync(path.join(root, "build", "keep.txt"), "tracked\n");
  run("git", ["add", "-f", "build/keep.txt"], root);
  run("git", ["commit", "-qm", "track build artifact"], root);
  fs.writeFileSync(path.join(root, "build", "cache.bin"), "untracked\n");

  const report = execute(root, ["--apply"]);
  assert.equal(fs.existsSync(path.join(root, "build", "keep.txt")), true);
  assert.equal(fs.existsSync(path.join(root, "build", "cache.bin")), true);
  assert.ok(report.trackedTempLike.some((entry) => entry.path === "build"));
});

test("an unignored directory named build is treated as user content", (context) => {
  const root = fixture();
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));

  fs.mkdirSync(path.join(root, "build"));
  fs.writeFileSync(path.join(root, "build", "draft.txt"), "user draft\n");

  const report = execute(root, ["--apply"]);
  assert.equal(fs.existsSync(path.join(root, "build", "draft.txt")), true);
  assert.ok(
    report.unclassified.some(
      (entry) => entry.path === "build" && entry.gitStatus === "untracked-directory-not-ignored",
    ),
  );
});

test("repo paths outside the workspace are rejected", (context) => {
  const root = fixture();
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));

  const result = spawnSync(
    process.execPath,
    [SCRIPT, "--workspace", root, "--repo", os.tmpdir(), "--json"],
    { cwd: root, encoding: "utf8" },
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /outside workspace/);
});

test("an allowlisted symlink is report-only and never followed", (context) => {
  const root = fixture();
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), "llamagen-temp-cleanup-outside-"));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));
  context.after(() => fs.rmSync(outside, { recursive: true, force: true }));

  fs.writeFileSync(path.join(outside, "keep.txt"), "outside\n");
  fs.symlinkSync(outside, path.join(root, ".next"));

  const report = execute(root, ["--apply"]);
  assert.equal(fs.existsSync(path.join(outside, "keep.txt")), true);
  assert.equal(fs.lstatSync(path.join(root, ".next")).isSymbolicLink(), true);
  assert.ok(report.unclassified.some((entry) => entry.path === ".next"));
});

test("workspace scans do not confuse an umbrella repository with a nested repository", (context) => {
  const root = fixture();
  const child = path.join(root, "child-app");
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));

  fs.mkdirSync(child);
  run("git", ["init", "-q"], child);
  run("git", ["config", "user.email", "cleanup-test@invalid.example"], child);
  run("git", ["config", "user.name", "Cleanup Test"], child);
  fs.writeFileSync(path.join(child, ".gitignore"), ".next/\n");
  fs.writeFileSync(path.join(child, "package.json"), '{"private":true}\n');
  run("git", ["add", ".gitignore", "package.json"], child);
  run("git", ["commit", "-qm", "child fixture"], child);
  fs.mkdirSync(path.join(child, ".next"));
  fs.writeFileSync(path.join(child, ".next", "cache.bin"), "cache\n");
  fs.writeFileSync(path.join(child, "draft.txt"), "ordinary untracked child file\n");

  const report = execute(root);
  assert.ok(report.candidates.some((entry) => entry.path === "child-app/.next"));
  assert.ok(report.unclassified.some((entry) => entry.path === "child-app/draft.txt"));
});
