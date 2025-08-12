import type { ActivitySourceType } from "./activity";

/** LLM Provider Types */
export type LLMProviderType = "openai" | "gemini" | "claude" | "none";

/** Notifier Provider Types */
export type NotifierProviderType = "discord" | "slack";

/** Configuration for monitoring a specific repository */
export type RepoConfig = {
  /** Repository Name @example "owner/repo" */
  name: string;
  /** Activity Source Types to monitor @see ActivitySourceType */
  monitorTypes: ActivitySourceType[];
  /** 
   * Patterns to ignore when monitoring activities.
   * Supports:
   * - URL patterns: "discussions/123", "issues/456"
   * - Author patterns: "@username" 
   * - Keyword patterns: plain text to match in title/body
   * @example ["discussions/123", "@bot-name", "이벤트"]
   */
  ignorePatterns?: string[];
};
