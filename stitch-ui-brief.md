# ToolBatcher Project Brief for Google Stitch

Use this brief to generate UI screens for the existing ToolBatcher product.

## Project Name
ToolBatcher

## What the Project Does
ToolBatcher is a web application that helps developer teams set up machines and environments quickly and consistently.

Users can:
1) Pick development tools (for example Git, Node, Python, Docker) and choose versions.
2) Select a target OS (Linux, macOS, Windows).
3) Generate either:
- a direct installation script, or
- a secure one-liner installer command tied to an install session.

The secure install-session flow includes:
1) Session token creation.
2) Manifest generation for selected tools/versions.
3) Manifest signature verification.
4) Bootstrap and runner scripts for shell and PowerShell.
5) Install event tracking and audit logs.

The goal is to reduce setup time, avoid environment drift, and make installation steps reviewable before execution.

## Target Users
1) Developers setting up local environments.
2) DevOps/platform engineers standardizing setup.
3) Engineering teams onboarding new members.

## Core Functional Areas
1) Tool catalog and version management.
2) Script generation.
3) One-liner installer session generation.
4) Install plan review.
5) Feedback collection.
6) Admin operations (tools, versions, feedback, install audits).

## Screens We Have

### 1) Home
Purpose:
- Explain product value and route users into the main workflow.

Main content blocks:
- Hero section
- Benefits/features overview
- Stats section
- CTA section
- Footer navigation

### 2) Tool Selector (Primary Workflow Screen)
Purpose:
- Main workspace for building install output.

Core UI elements:
1) Tool list with checkboxes.
2) Per-tool version selector.
3) Target OS selector.
4) Generate Script action.
5) Generate One-Liner Installer action.
6) Output area for generated command/script.
7) Copy action.
8) Download action (script mode).
9) Install plan review section (installer mode).

### 3) Documentation
Purpose:
- Show usage guidance and example code.

Core UI elements:
1) Documentation content sections.
2) Code display/edit area.
3) Copy/edit/download controls.

### 4) How To Use
Purpose:
- Step-by-step explanation of using ToolBatcher.

Core UI elements:
1) Sequential usage steps.
2) Supporting explanatory content.

### 5) Features
Purpose:
- Explain major product capabilities.

Core UI elements:
1) Feature list.
2) Feature descriptions.

### 6) About
Purpose:
- Explain the project mission and context.

Core UI elements:
1) Product narrative.
2) Key value points.

### 7) Feedback
Purpose:
- Collect feedback and suggestions from users.

Core UI elements:
1) Feedback form (name, email, message).
2) Submission status (success/error).

### 8) Admin Dashboard
Purpose:
- Operational control for tools and install-session activity.

Core UI elements:
1) Tool CRUD form and listing.
2) Trigger tool version refresh.
3) Feedback list with status updates.
4) Install audit log viewer.

## Key User Flows

### Flow A: Generate Script
1) User opens Tool Selector.
2) Selects tools and versions.
3) Selects target OS.
4) Generates script.
5) Copies or downloads output.

### Flow B: Generate One-Liner Installer
1) User selects tools, versions, and OS.
2) Generates one-liner installer.
3) Reviews install plan if needed.
4) Copies command.

### Flow C: Admin Operations
1) Admin manages tools and commands.
2) Admin triggers version updates.
3) Admin reviews feedback.
4) Admin checks install session audit logs.

## Prompt Line for Stitch
Create UI screens for ToolBatcher, a web app that generates cross-platform tool installation scripts and secure one-liner installer sessions for developer teams. Include screens for Home, Tool Selector, Documentation, How To Use, Features, About, Feedback, and Admin Dashboard, based on the functionality described above.
