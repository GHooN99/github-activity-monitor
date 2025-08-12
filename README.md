# GitHub Activity Monitor

A powerful tool to track and monitor activities in public GitHub repositories, with optional AI-powered summarization and notification capabilities.

_Read this in [Korean (한국어)](./README_ko.md)_

## Overview

GitHub Activity Monitor lets you track meaningful discussions, PRs, issues, and comments from any public GitHub repository, even those you don't own. It solves the problem of not having webhook access to repositories you're interested in by directly fetching and monitoring activities.

Key features:

- Monitor discussions, issues, pull requests, and comments from public repositories
- AI-powered summarization using Gemini, OpenAI, or other LLM providers
- Send notifications to Discord or Slack
- Configurable tracking with flexible repository monitoring options
- Filter out unwanted activities using patterns (URLs, keywords, authors)

## CAUTION: Current Implementation Status

**Important Note**: This project is still under active development. Currently, only the following features are fully implemented:

- Gemini AI provider for summarization
- GitHub Discussions and Discussion Comments monitoring
- Discord notifications

Other features mentioned in the documentation will be implemented in future updates. You can also implement these interfaces yourself to add the functionality you need.

## Installation

There are two ways to use this tool:

### Method 1: Fork and Configure (Recommended)

1. Fork this repository to your GitHub account
2. **Important**: Delete the `state.json` file if it exists in your forked repository to start with a clean state
3. Configure your `.env` and `monitor.config.ts` files
4. Set up GitHub Actions workflow (see below)

### Method 2: Local Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/github-activity-monitor.git
cd github-activity-monitor

# Install dependencies using pnpm
pnpm install

# Set up environment variables (copy and edit)
cp .env.example .env
```

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```
MONITOR_GITHUB_PAT=your_github_pat
OPENAI_API_KEY=your_openai_api_key
GOOGLE_API_KEY=your_google_api_key
CLAUDE_API_KEY=your_claude_api_key
DISCORD_WEBHOOK_URL=your_discord_webhook_url
SLACK_WEBHOOK_URL=your_slack_webhook_url
```

**Note:** At minimum, you need to provide `MONITOR_GITHUB_PAT` and either `DISCORD_WEBHOOK_URL` or `SLACK_WEBHOOK_URL`.

**Important for GitHub PAT**: When creating your GitHub Personal Access Token, make sure to enable read permissions for all repository resources, especially:

- Discussions (read)
- Pull Requests (read)
- Issues (read)
- Contents (read)
- Metadata (read)

Without these permissions, the monitor won't be able to access the required information from the repositories.

### Monitor Configuration

Edit the `monitor.config.ts` file to customize your monitoring settings:

```typescript
export const config = {
  repoConfigs: [
    {
      name: "owner/repo",
      monitorTypes: ["discussion", "discussion_comment"],
      // Optional: Filter out unwanted activities
      ignorePatterns: [
        "discussions/123", // Ignore specific discussion by ID
        "event", // Ignore activities containing "event" keyword
        "@bot-name", // Ignore activities from specific author
      ],
    },
    // Add more repositories as needed
  ],
  stateFilePath: "state.json",
  maxItemsPerRun: 5,
  summarizationEnabled: true,
  llmProvider: "gemini", // or "openai", "claude", "none"
  llmModelName: "gemini-2.0-flash-lite", // or your preferred model
};
```

### Filtering Activities

You can filter out unwanted activities using the `ignorePatterns` option in your repository configuration. The patterns are automatically detected based on their format:

- **URL/ID patterns**: `discussions/123`, `issues/456`, `pull/789` - Ignores specific discussions, issues, or PRs
- **Author patterns**: `@username` - Ignores activities from specific users (prefix with `@`)
- **Keyword patterns**: Any plain text - Ignores activities containing these keywords in title or body

Example use cases:

- Filter out event announcements: Add keywords like "event", "giveaway", "contest"
- Ignore bot activities: Use patterns like `@dependabot`, `@renovate-bot`
- Skip specific discussions: Use the discussion ID from its URL

## Usage

### Using GitHub Actions (Recommended)

This repository includes a GitHub Actions workflow that automatically runs the monitor on a schedule.

1. Fork this repository to your GitHub account
2. Go to your forked repository's Settings > Secrets and variables > Actions
3. Add the required environment variables as repository secrets:
   - `MONITOR_GITHUB_PAT`
   - `DISCORD_WEBHOOK_URL` or `SLACK_WEBHOOK_URL`
   - Optional: `GOOGLE_API_KEY`, `OPENAI_API_KEY`, or `CLAUDE_API_KEY` (for summarization)
4. Edit the `.github/workflows/monitor.yml` file to customize the schedule
5. Enable GitHub Actions in your repository settings

The monitor will now run automatically according to the schedule you defined.

### Running Locally

```bash
# Run in development mode (with file watching)
pnpm dev

# Build the project
pnpm build

# Run in production mode
pnpm start
```

You can also set up a cron job or scheduled task to run the monitor periodically:

```bash
# Example cron job (runs every hour)
0 * * * * cd /path/to/github-activity-monitor && pnpm start > /path/to/logfile.log 2>&1
```

## Development

### Project Structure

```
src/
├── configs/            # Configuration handling
├── core/               # Core application logic
├── models/             # Data models and types
└── modules/
    ├── activity-fetching/    # GitHub API interaction
    ├── filtering/            # Activity filtering logic
    ├── http-client/          # HTTP client abstraction
    ├── notification/         # Discord/Slack notification
    ├── persistence/          # File system operations
    ├── state-management/     # Tracking state between runs
    └── summarization/        # AI summarization logic
```

### Key Scripts

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format
```

### Requirements

- Node.js >= 20.0.0
- pnpm >= 10.0.0 (recommended package manager)
- A valid GitHub Personal Access Token
- (Optional) API key for OpenAI, Google (Gemini), or Anthropic (Claude)
- Discord or Slack webhook URL for notifications

## Contributions

Contributions are welcome! Please feel free to submit a Pull Request.
