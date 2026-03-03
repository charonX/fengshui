# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an OpenSpec-based project using the `spec-driven` schema. OpenSpec is a workflow system for managing code changes through structured artifacts (proposals, designs, specs, tasks).

## Core Commands

```bash
# List all changes (active and archived)
openspec list --json

# Get status of a specific change
openspec status --change "<name>" --json

# Create a new change
openspec new change "<name>"

# Get instructions for an artifact or action
openspec instructions <artifact-id> --change "<name>" --json
openspec instructions apply --change "<name>" --json
```

## Workflow

### 1. Propose a Change
Use `/opsx:propose` or `openspec-propose` skill to create a new change with artifacts:
- `proposal.md` - What and why
- `design.md` - How
- `tasks.md` - Implementation steps

### 2. Implement
Use `/opsx:apply` or `openspec-apply-change` skill to work through tasks. Tasks are tracked with checkboxes (`- [ ]` → `- [x]`).

### 3. Archive
Use `/opsx:archive` or `openspec-archive-change` skill when complete. Archives to `openspec/changes/archive/YYYY-MM-DD-<name>/`.

## Directory Structure

```
openspec/
  config.yaml          # Schema configuration (spec-driven)
  specs/               # Main specification files
  changes/
    <change-name>/     # Active changes
      .openspec.yaml   # Change metadata
      proposal.md
      design.md
      tasks.md
    archive/           # Completed changes
```

## Claude Commands

- `/opsx:explore [topic]` - Enter explore mode for thinking/investigation (no implementation)
- `/opsx:propose [change-name]` - Create a new change with all artifacts
- `/opsx:apply [change-name]` - Implement tasks from a change
- `/opsx:archive [change-name]` - Archive a completed change

## Key Conventions

- Change names are kebab-case (e.g., `add-user-auth`)
- Task checkboxes: `- [ ]` for pending, `- [x]` for complete
- Delta specs in `openspec/changes/<name>/specs/` sync to `openspec/specs/` on archive
- Always check `openspec list --json` to understand active changes before working
