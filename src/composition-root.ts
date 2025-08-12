import { AppConfig } from "./configs/app-config";
import { ActivityMonitor } from "./core/activity-monitor";
import { ActivityProcessor } from "./core/activity-processor";
import { StateProcessor } from "./core/state-processor";
import { IActivityFetcher } from "./modules/activity-fetching/activity-fetcher";
import { GithubActivityAggregator } from "./modules/activity-fetching/github-activity-aggregator";
import { GithubDiscussionFetcher } from "./modules/activity-fetching/github-discussion-fetcher";
import { KyHttpClient } from "./modules/http-client/ky-http-client";
import { DiscordNotifier } from "./modules/notification/discord-notifier";
import { DiscordMessageFormatter } from "./modules/notification/message-formatter/discord-message-formatter";
import { INotifier } from "./modules/notification/notifier";
import { NodeFileSystem } from "./modules/persistence/node-file-system";
import { JsonStateManager } from "./modules/state-management/json-state-manager";
import { IStateManager } from "./modules/state-management/state-manager";
import { GeminiSummarizer } from "./modules/summarization/gemini-summarizer";
import { IActivitySummarizer } from "./modules/summarization/summarizer";
import { IPatternMatcher, PatternMatcher } from "./modules/filtering/pattern-matcher";

function createActivityFetcher(config: AppConfig): IActivityFetcher {
  const discussionFetcher = new GithubDiscussionFetcher(config);
  return new GithubActivityAggregator(
    {
      discussionFetcher,
    },
    config.repoConfigs
  );
}

function createStateManager(config: AppConfig): IStateManager {
  const fileSystem = new NodeFileSystem();
  return new JsonStateManager(config.stateFilePath, fileSystem);
}

function createNotifier(config: AppConfig): INotifier {
  const httpClient = new KyHttpClient();

  // TODO: Dynamic Notifier Instance via config
  const discordFormatter = new DiscordMessageFormatter();

  return new DiscordNotifier(config.discordWebhookUrl!, httpClient, discordFormatter);
}

function createSummarizer(config: AppConfig): IActivitySummarizer {
  // TODO: Dynamic Summarizer Instance via config
  return new GeminiSummarizer(config);
}

function createPatternMatchers(config: AppConfig): Map<string, IPatternMatcher> {
  const matchers = new Map<string, IPatternMatcher>();
  
  for (const repoConfig of config.repoConfigs) {
    if (repoConfig.ignorePatterns && repoConfig.ignorePatterns.length > 0) {
      matchers.set(repoConfig.name, new PatternMatcher(repoConfig.ignorePatterns));
    }
  }
  
  return matchers;
}

export function setupApplication(config: AppConfig): ActivityMonitor {
  const stateManager = createStateManager(config);
  const fetcher = createActivityFetcher(config);
  const notifier = createNotifier(config);
  const summarizer = createSummarizer(config);
  const patternMatchers = createPatternMatchers(config);

  const activityProcessor = new ActivityProcessor({
    config,
    summarizer,
    patternMatchers,
  });

  const stateProcessor = new StateProcessor();

  return new ActivityMonitor({
    fetcher,
    stateManager,
    activityProcessor,
    stateProcessor,
    notifier,
  });
}
