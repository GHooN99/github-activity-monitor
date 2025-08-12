import type { AppVariables } from "./src/configs/app-config";

/**
 * Configuration for the GitHub Activity Monitor.
 */
export const config: AppVariables = {
  /**
   * Repositories to monitor and the types of activities to track.
   * - `name`: The full repository name (e.g., "owner/repo").
   * - `monitorTypes`: An array of activity types to monitor for this repository.
   *   Supported types: "issue", "issue_comment", "pull_request", "pull_request_review_comment", "discussion", "discussion_comment".
   * @example
   * {
   *   name: "vercel/next.js",
   *   monitorTypes: ["discussion", "discussion_comment", "issue"],
   * }
   */
  repoConfigs: [
    // {
    //   name: "vercel/next.js",
    //   monitorTypes: ["discussion", "discussion_comment"],
    // },
    {
      name: "toss/frontend-fundamentals",
      monitorTypes: ["discussion", "discussion_comment"],
      ignorePatterns: ["discussions/309", "@giscus"],
      // Optional: Patterns to ignore
      // ignorePatterns: [
      //   "discussions/123",     // Ignore specific discussion by ID
      //   "이벤트",              // Ignore activities containing "이벤트" keyword
      //   "추첨",                // Ignore activities containing "추첨" keyword
      //   "@event-bot"           // Ignore activities from user "event-bot"
      // ],
    },
  ],

  /**
   * Path to the file where the monitoring state (e.g., last checked timestamp) will be stored.
   * @default "state.json"
   */
  stateFilePath: "state.json",

  /**
   * Maximum number of new items (discussions, issues, etc.) to process in a single run per repository.
   * Helps to avoid hitting API rate limits and manage processing load.
   * @default 5
   */
  maxItemsPerRun: 5,

  /**
   * Whether to enable AI-powered summarization for fetched activities.
   * If set to `true`, requires configuring `llmProvider` and `llmModelName`.
   * @default false
   */
  summarizationEnabled: true,

  /**
   * The Large Language Model (LLM) provider to use for summarization.
   * Required if `summarizationEnabled` is `true`.
   * Supported providers: "gemini", "openai" // (Add other supported providers as needed)
   * @default "none"
   */
  llmProvider: "gemini", // Or "openai", etc.

  /**
   * The specific model name from the selected LLM provider to use for summarization.
   * Required if `summarizationEnabled` is `true`.
   * @example "gemini-1.5-flash-latest", "gpt-4o"
   * @default ""
   */
  llmModelName: "gemini-2.5-flash", // Or the specific model you intend to use
};
