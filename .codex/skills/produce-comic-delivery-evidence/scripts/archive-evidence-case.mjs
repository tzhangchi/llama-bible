#!/usr/bin/env node

import crypto from "node:crypto";
import { constants as fsConstants } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = path.resolve(SCRIPT_DIR, "..");
const WORKSPACE_ROOT = path.resolve(SKILL_ROOT, "../../..");
const RUN_ARCHIVE_ROOT = path.join(SKILL_ROOT, "assets/local-run-archives");
const RUN_MANIFEST_ROOT = path.join(SKILL_ROOT, "assets/run-manifests");
const PUBLIC_ARCHIVE_ROOT = path.join(
  SKILL_ROOT,
  "assets/local-public-archives",
);
const PUBLIC_MANIFEST_ROOT = path.join(SKILL_ROOT, "assets/public-manifests");
const CASE_ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;
const SENSITIVE_NAME_PATTERN =
  /(^|\/)(\.env(?:\.|$)|rclone\.conf$|.*credentials?.*|.*secret.*|.*private[-_]?key.*)/i;
const IGNORED_NAME_PATTERN = /(^|\/)\.DS_Store$/;
const TEXT_EXTENSIONS = new Set([
  ".csv",
  ".json",
  ".md",
  ".txt",
  ".yaml",
  ".yml",
]);
const IMAGE_EXTENSIONS = new Set([
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".svg",
  ".webp",
]);

function parseArgs(argv) {
  const options = {
    caseId: "",
    apply: false,
    verify: false,
    copy: false,
    public: false,
  };

  for (const value of argv) {
    if (value === "--apply") options.apply = true;
    else if (value === "--verify") options.verify = true;
    else if (value === "--copy") options.copy = true;
    else if (value === "--public") options.public = true;
    else if (!value.startsWith("--") && !options.caseId) options.caseId = value;
    else throw new Error(`Unknown argument: ${value}`);
  }

  if (!CASE_ID_PATTERN.test(options.caseId)) {
    throw new Error("Provide one lowercase hyphenated evidence case ID.");
  }
  if (options.apply && options.verify) {
    throw new Error("Choose either --apply or --verify, not both.");
  }
  if (options.copy && !options.apply) {
    throw new Error("--copy is valid only with --apply.");
  }
  return options;
}

async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function sha256File(filePath) {
  const content = await fs.readFile(filePath);
  return crypto.createHash("sha256").update(content).digest("hex");
}

async function walkFiles(root, current = root) {
  const entries = await fs.readdir(current, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const absolute = path.join(current, entry.name);
    if (entry.isDirectory()) files.push(...(await walkFiles(root, absolute)));
    else if (entry.isFile()) files.push(absolute);
    else
      throw new Error(
        `Unsupported archive entry: ${path.relative(root, absolute)}`,
      );
  }
  return files;
}

function classify(relativePath) {
  const extension = path.extname(relativePath).toLowerCase();
  if (TEXT_EXTENSIONS.has(extension)) return "text";
  if (IMAGE_EXTENSIONS.has(extension)) return "image";
  return "other";
}

async function buildInventory(sourceRoot) {
  const absoluteFiles = await walkFiles(sourceRoot);
  const files = [];
  for (const absolutePath of absoluteFiles) {
    const relativePath = path
      .relative(sourceRoot, absolutePath)
      .split(path.sep)
      .join("/");
    if (IGNORED_NAME_PATTERN.test(relativePath)) continue;
    if (SENSITIVE_NAME_PATTERN.test(relativePath)) {
      throw new Error(
        `Refusing to archive suspicious filename: ${relativePath}`,
      );
    }
    const stat = await fs.stat(absolutePath);
    files.push({
      path: relativePath,
      bytes: stat.size,
      sha256: await sha256File(absolutePath),
      kind: classify(relativePath),
    });
  }
  return files;
}

function summarize(files) {
  return files.reduce(
    (summary, file) => {
      summary.files += 1;
      summary.bytes += file.bytes;
      summary[`${file.kind}Files`] += 1;
      return summary;
    },
    { files: 0, bytes: 0, textFiles: 0, imageFiles: 0, otherFiles: 0 },
  );
}

async function createArchive(sourceRoot, destinationRoot, files, copyMode) {
  if (await exists(destinationRoot)) {
    throw new Error(
      `Archive already exists and will not be overwritten: ${destinationRoot}`,
    );
  }
  await fs.mkdir(destinationRoot, { recursive: false });
  let fallbackCopies = 0;
  for (const file of files) {
    const source = path.join(sourceRoot, file.path);
    const destination = path.join(destinationRoot, file.path);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    if (!copyMode) {
      try {
        await fs.copyFile(
          source,
          destination,
          fsConstants.COPYFILE_FICLONE_FORCE,
        );
        continue;
      } catch (error) {
        if (
          !new Set(["ENOSYS", "ENOTSUP", "EOPNOTSUPP", "EXDEV", "EINVAL"]).has(
            error?.code,
          )
        ) {
          throw error;
        }
      }
    }
    await fs.copyFile(source, destination);
    if (!copyMode) {
      fallbackCopies += 1;
    }
  }
  return fallbackCopies;
}

async function verifyArchive(destinationRoot, manifest) {
  const failures = [];
  for (const file of manifest.files) {
    const archivedPath = path.join(destinationRoot, file.path);
    if (!(await exists(archivedPath))) {
      failures.push(`${file.path}: missing`);
      continue;
    }
    const stat = await fs.stat(archivedPath);
    if (stat.size !== file.bytes) failures.push(`${file.path}: size mismatch`);
    if ((await sha256File(archivedPath)) !== file.sha256) {
      failures.push(`${file.path}: SHA-256 mismatch`);
    }
  }
  return failures;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const scope = options.public ? "public-delivery" : "generation-run";
  const sourceRoot = path.join(
    WORKSPACE_ROOT,
    options.public
      ? "llamagen.ai/public/evidence"
      : "llamagen.ai/tmp/comic-delivery-evidence",
    options.caseId,
  );
  const archiveRoot = options.public ? PUBLIC_ARCHIVE_ROOT : RUN_ARCHIVE_ROOT;
  const manifestRoot = options.public
    ? PUBLIC_MANIFEST_ROOT
    : RUN_MANIFEST_ROOT;
  const destinationRoot = path.join(archiveRoot, options.caseId);
  const manifestPath = path.join(manifestRoot, `${options.caseId}.json`);

  if (options.verify) {
    if (!(await exists(destinationRoot)) || !(await exists(manifestPath))) {
      throw new Error(`Archive or manifest is missing for ${options.caseId}.`);
    }
    const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
    const failures = await verifyArchive(destinationRoot, manifest);
    if (failures.length)
      throw new Error(`Archive verification failed:\n${failures.join("\n")}`);
    console.log(
      JSON.stringify(
        {
          status: "verified",
          scope,
          caseId: options.caseId,
          ...manifest.summary,
        },
        null,
        2,
      ),
    );
    return;
  }

  if (!(await exists(sourceRoot))) {
    throw new Error(`Evidence bundle does not exist: ${sourceRoot}`);
  }
  const files = await buildInventory(sourceRoot);
  const summary = summarize(files);
  if (!options.apply) {
    console.log(
      JSON.stringify(
        {
          status: "dry-run",
          scope,
          caseId: options.caseId,
          source: path.relative(WORKSPACE_ROOT, sourceRoot),
          destination: path.relative(WORKSPACE_ROOT, destinationRoot),
          ...summary,
        },
        null,
        2,
      ),
    );
    return;
  }

  await fs.mkdir(archiveRoot, { recursive: true });
  await fs.mkdir(manifestRoot, { recursive: true });
  const fallbackCopies = await createArchive(
    sourceRoot,
    destinationRoot,
    files,
    options.copy,
  );
  const manifest = {
    schemaVersion: 1,
    caseId: options.caseId,
    scope,
    archivedAt: new Date().toISOString(),
    source: path.relative(WORKSPACE_ROOT, sourceRoot).split(path.sep).join("/"),
    archive: path
      .relative(WORKSPACE_ROOT, destinationRoot)
      .split(path.sep)
      .join("/"),
    storageMode: options.copy
      ? "copy"
      : fallbackCopies === files.length
        ? "copy-fallback"
        : fallbackCopies
          ? "copy-on-write-clone-with-copy-fallback"
          : "copy-on-write-clone",
    fallbackCopies,
    summary,
    files,
  };
  await fs.writeFile(
    manifestPath,
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
  console.log(
    JSON.stringify(
      {
        status: "archived",
        scope,
        caseId: options.caseId,
        manifest: path.relative(WORKSPACE_ROOT, manifestPath),
        storageMode: manifest.storageMode,
        ...summary,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
