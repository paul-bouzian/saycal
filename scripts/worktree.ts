#!/usr/bin/env bun
/**
 * Git Worktree Manager
 *
 * Usage:
 *   bun worktree create <branch>       - Create worktree for existing branch
 *   bun worktree create <branch> --new - Create worktree + new branch from main
 *   bun worktree remove [branch]       - Remove a worktree (auto-detects current)
 *   bun worktree list                  - List all worktrees
 *
 * Shell wrapper (add to ~/.zshrc):
 *   wt() {
 *     local output
 *     output=$(bun worktree "$@" 2>&1)
 *     echo "$output" | grep -v "^__CD__:"
 *     local cd_path=$(echo "$output" | grep "^__CD__:" | cut -d: -f2-)
 *     [[ -n "$cd_path" ]] && cd "$cd_path"
 *   }
 */

import { $ } from "bun"
import { access, copyFile, mkdir, readFile, rm } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"

// ============================================================================
// Constants
// ============================================================================

/**
 * Get the main repository root (not worktree root).
 * In a worktree, .git is a file pointing to the main repo's .git/worktrees/<name>
 */
async function getMainRepoRoot(): Promise<string> {
	const gitDir = await $`git rev-parse --git-dir`.quiet().text()
	const gitPath = resolve(gitDir.trim())

	// Check if .git is a file (worktree) or directory (main repo)
	const gitContent = await readFile(join(process.cwd(), ".git"), "utf-8").catch(
		() => null
	)

	if (gitContent?.startsWith("gitdir:")) {
		// We're in a worktree - parse the path to find main repo
		// gitdir: /path/to/main-repo/.git/worktrees/<name>
		const gitdirPath = gitContent.replace("gitdir:", "").trim()
		const mainGitDir = gitdirPath.replace(/\/\.git\/worktrees\/.*$/, "")
		return mainGitDir
	}

	// We're in the main repo
	return dirname(gitPath)
}

const ROOT_DIR = await getMainRepoRoot()
const WORKTREES_DIR = join(ROOT_DIR, ".worktrees")
const ENV_FILE = join(ROOT_DIR, ".env.local")

// ============================================================================
// Colors
// ============================================================================

const colors = {
	reset: "\x1b[0m",
	bold: "\x1b[1m",
	dim: "\x1b[2m",

	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
}

const log = {
	info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
	success: (msg: string) =>
		console.log(`${colors.green}✔${colors.reset} ${msg}`),
	warn: (msg: string) =>
		console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
	error: (msg: string) => console.log(`${colors.red}✖${colors.reset} ${msg}`),
	step: (msg: string) =>
		console.log(`${colors.cyan}→${colors.reset} ${colors.dim}${msg}${colors.reset}`),
}

// ============================================================================
// Helpers
// ============================================================================

async function exists(path: string): Promise<boolean> {
	try {
		await access(path)
		return true
	} catch {
		return false
	}
}

function sanitizeBranchName(branch: string): string {
	return branch.replace(/\//g, "-")
}

function printUsage(): void {
	console.log(`
${colors.bold}Git Worktree Manager${colors.reset}

${colors.yellow}Usage:${colors.reset}
  bun worktree create <branch>         Create worktree for existing branch
  bun worktree create <branch> --new   Create worktree + new branch from main
  bun worktree remove [branch]         Remove a worktree (auto-detects if inside one)
  bun worktree list                    List all worktrees

${colors.yellow}Shell wrapper (add to ~/.zshrc):${colors.reset}
  wt() {
    local output
    output=$(bun worktree "$@" 2>&1)
    echo "$output" | grep -v "^__CD__:"
    local cd_path=$(echo "$output" | grep "^__CD__:" | cut -d: -f2-)
    [[ -n "$cd_path" ]] && cd "$cd_path"
  }

${colors.yellow}Examples:${colors.reset}
  wt create feature/new-ui         # Creates + cd into worktree
  wt create fix/bug-123 --new      # Creates new branch + cd into worktree
  wt rm                            # From inside worktree: removes + cd back to main
  wt rm feature/new-ui             # Removes specific worktree
`)
}

async function branchExists(branch: string): Promise<boolean> {
	// Check local branches
	const local = await $`git branch --list ${branch}`.quiet().text()
	if (local.trim()) return true

	// Check remote branches
	const remote = await $`git branch -r --list origin/${branch}`.quiet().text()
	return !!remote.trim()
}

async function getCurrentWorktreeBranch(): Promise<string | null> {
	// Use original cwd passed from shell wrapper, or fall back to process.cwd()
	const cwd = process.env.WT_ORIGINAL_CWD || process.cwd()

	// Check if we're in a worktree under .worktrees/
	if (!cwd.includes(".worktrees")) return null

	// Get the worktree folder name
	const match = cwd.match(/\.worktrees\/([^/]+)/)
	if (!match) return null

	const sanitizedName = match[1]

	// Get the actual branch name from git (run in original cwd)
	try {
		const branch = await $`git rev-parse --abbrev-ref HEAD`.cwd(cwd).quiet().text()
		return branch.trim()
	} catch {
		return sanitizedName
	}
}

async function ensureWorktreesDir(): Promise<void> {
	if (!(await exists(WORKTREES_DIR))) {
		await mkdir(WORKTREES_DIR, { recursive: true })
		log.step(`Created ${WORKTREES_DIR}`)
	}
}

// ============================================================================
// Commands
// ============================================================================

async function create(branch: string, isNew: boolean): Promise<void> {
	const sanitized = sanitizeBranchName(branch)
	const worktreePath = join(WORKTREES_DIR, sanitized)

	log.info(`Creating worktree for branch: ${colors.bold}${branch}${colors.reset}`)

	// Check if worktree already exists
	if (await exists(worktreePath)) {
		log.error(`Worktree already exists at: ${worktreePath}`)
		process.exit(1)
	}

	// Ensure .worktrees directory exists
	await ensureWorktreesDir()

	// Fetch latest from remote
	log.step("Fetching latest from remote...")
	await $`git fetch origin`.quiet()

	if (isNew) {
		// Create new branch from main
		log.step(`Creating new branch ${branch} from origin/main...`)
		await $`git worktree add -b ${branch} ${worktreePath} origin/main`
	} else {
		// Check if branch exists
		if (!(await branchExists(branch))) {
			log.error(`Branch "${branch}" does not exist locally or on remote.`)
			log.info(`Use ${colors.cyan}--new${colors.reset} flag to create a new branch.`)
			process.exit(1)
		}

		// Create worktree for existing branch
		log.step(`Adding worktree for ${branch}...`)
		try {
			await $`git worktree add ${worktreePath} ${branch}`
		} catch {
			// Branch might be remote-only, try with origin/
			await $`git worktree add ${worktreePath} origin/${branch}`
		}
	}

	// Copy .env.local file
	if (await exists(ENV_FILE)) {
		log.step("Copying .env.local file...")
		await copyFile(ENV_FILE, join(worktreePath, ".env.local"))
	} else {
		log.warn("No .env.local file found in root directory")
	}

	// Run bun install
	log.step("Installing dependencies with bun...")
	await $`bun install`.cwd(worktreePath)

	// Success message
	console.log("")
	log.success(`Worktree created successfully!`)
	console.log("")
	console.log(`  ${colors.dim}Path:${colors.reset}   ${worktreePath}`)
	console.log(`  ${colors.dim}Branch:${colors.reset} ${branch}`)
	console.log("")

	// Output CD marker for shell wrapper
	console.log(`__CD__:${worktreePath}`)
}

async function remove(branch: string | null): Promise<void> {
	// Auto-detect branch if not provided and we're inside a worktree
	if (!branch) {
		branch = await getCurrentWorktreeBranch()
		if (!branch) {
			log.error("Not inside a worktree and no branch specified")
			printUsage()
			process.exit(1)
		}
		log.info(`Auto-detected current worktree: ${colors.bold}${branch}${colors.reset}`)
	}

	const sanitized = sanitizeBranchName(branch)
	const worktreePath = join(WORKTREES_DIR, sanitized)

	log.info(`Removing worktree for branch: ${colors.bold}${branch}${colors.reset}`)

	// Check if worktree exists
	if (!(await exists(worktreePath))) {
		log.error(`Worktree not found at: ${worktreePath}`)
		process.exit(1)
	}

	// Check if we're currently inside the worktree being removed
	const originalCwd = process.env.WT_ORIGINAL_CWD || process.cwd()
	const isInsideWorktree = originalCwd.startsWith(worktreePath)

	// Remove worktree using git (must run from ROOT_DIR to avoid issues)
	log.step("Removing git worktree...")
	try {
		await $`git worktree remove ${worktreePath} --force`.cwd(ROOT_DIR)
	} catch {
		// If git worktree remove fails, clean up manually
		log.warn("Git worktree remove failed, cleaning up manually...")
		await rm(worktreePath, { recursive: true, force: true })
		await $`git worktree prune`.cwd(ROOT_DIR)
	}

	log.success(`Worktree removed: ${sanitized}`)

	// Delete the local branch
	log.step(`Deleting local branch ${branch}...`)
	try {
		await $`git branch -D ${branch}`.cwd(ROOT_DIR).quiet()
		log.success(`Branch deleted: ${branch}`)
	} catch {
		log.warn(`Could not delete branch ${branch} (may have unmerged changes or be checked out elsewhere)`)
	}

	// Output CD marker to go back to root if we were inside the worktree
	if (isInsideWorktree) {
		console.log(`__CD__:${ROOT_DIR}`)
	}
}

async function list(): Promise<void> {
	console.log(`\n${colors.bold}Git Worktrees${colors.reset}\n`)

	const result = await $`git worktree list`.text()
	const lines = result.trim().split("\n")

	for (const line of lines) {
		const parts = line.split(/\s+/)
		const path = parts[0]
		const commit = parts[1]
		const branch = parts[2]?.replace(/[[\]]/g, "") || ""

		const isMain = path === ROOT_DIR
		const icon = isMain ? "●" : "○"
		const color = isMain ? colors.green : colors.cyan

		console.log(`  ${color}${icon}${colors.reset} ${branch || "detached"}`)
		console.log(`    ${colors.dim}${path}${colors.reset}`)
		console.log(`    ${colors.dim}${commit}${colors.reset}`)
		console.log("")
	}
}

// ============================================================================
// CLI
// ============================================================================

async function main(): Promise<void> {
	const args = process.argv.slice(2)
	const command = args[0]

	if (!command || command === "help" || command === "--help" || command === "-h") {
		printUsage()
		process.exit(0)
	}

	switch (command) {
		case "create": {
			const branch = args[1]
			const isNew = args.includes("--new") || args.includes("-n")

			if (!branch) {
				log.error("Branch name is required")
				printUsage()
				process.exit(1)
			}

			await create(branch, isNew)
			break
		}

		case "remove":
		case "rm": {
			const branch = args[1] || null
			await remove(branch)
			break
		}

		case "list":
		case "ls":
			await list()
			break

		default:
			log.error(`Unknown command: ${command}`)
			printUsage()
			process.exit(1)
	}
}

main().catch((err) => {
	log.error(err.message)
	process.exit(1)
})
