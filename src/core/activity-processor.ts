import { AppConfig } from "../configs/app-config";
import { ActivityItem } from "../models/activity";
import { IActivitySummarizer } from "../modules/summarization/summarizer";
import { IPatternMatcher } from "../modules/filtering/pattern-matcher";

export interface IActivityProcessor {
  processForNotification(activities: ActivityItem[]): Promise<ActivityItem[]>;
}

interface ActivityProcessorDependencies {
  config: AppConfig;
  summarizer: IActivitySummarizer;
  patternMatchers: Map<string, IPatternMatcher>;
}

export class ActivityProcessor implements IActivityProcessor {
  public constructor(private readonly dependencies: ActivityProcessorDependencies) {}

  public async processForNotification(fetchedActivities: ActivityItem[]): Promise<ActivityItem[]> {
    const { config } = this.dependencies;

    // First, filter out ignored activities
    const nonIgnoredActivities = this.filterIgnoredActivities(fetchedActivities);

    const activitiesByRepo = this.groupActivitiesByRepo(nonIgnoredActivities);

    const filteredActivities = this.filterRecentActivitiesByTypePerRepo(
      activitiesByRepo,
      config.maxItemsPerRun
    );

    const sortedActivities = this.sortActivitiesChronologically(filteredActivities);

    return await this.summarizeIfNeeded(sortedActivities);
  }

  private groupActivitiesByRepo(activities: ActivityItem[]): Record<string, ActivityItem[]> {
    const activitiesByRepo: Record<string, ActivityItem[]> = {};
    for (const activity of activities) {
      if (!activity.repo) continue;
      if (!activitiesByRepo[activity.repo]) {
        activitiesByRepo[activity.repo] = [];
      }
      activitiesByRepo[activity.repo].push(activity);
    }
    return activitiesByRepo;
  }

  private filterRecentActivitiesByTypePerRepo(
    activitiesByRepo: Record<string, ActivityItem[]>,
    maxItemsPerType: number
  ): ActivityItem[] {
    const filtered: ActivityItem[] = [];

    for (const repoName in activitiesByRepo) {
      const repoActivities = activitiesByRepo[repoName];

      const activitiesByType: Record<string, ActivityItem[]> = {};
      for (const activity of repoActivities) {
        if (!activitiesByType[activity.sourceType]) {
          activitiesByType[activity.sourceType] = [];
        }
        activitiesByType[activity.sourceType].push(activity);
      }

      for (const sourceType in activitiesByType) {
        const typeActivities = activitiesByType[sourceType];

        const sortedTypeActivities = [...typeActivities].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const itemsForThisType = sortedTypeActivities.slice(0, maxItemsPerType);
        filtered.push(...itemsForThisType);
      }
    }

    return filtered;
  }

  private sortActivitiesChronologically(activities: ActivityItem[]): ActivityItem[] {
    return [...activities].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  private filterIgnoredActivities(activities: ActivityItem[]): ActivityItem[] {
    const { patternMatchers } = this.dependencies;
    const filtered: ActivityItem[] = [];
    
    for (const activity of activities) {
      const matcher = patternMatchers.get(activity.repo);
      
      // If no matcher for this repo, or activity should not be ignored, keep it
      if (!matcher || !matcher.shouldIgnore(activity)) {
        filtered.push(activity);
      } else {
        console.log(`Ignoring activity: ${activity.title} (${activity.url})`);
      }
    }
    
    return filtered;
  }

  private async summarizeIfNeeded(activities: ActivityItem[]): Promise<ActivityItem[]> {
    const { config, summarizer } = this.dependencies;
    if (config.summarizationEnabled && activities.length > 0) {
      console.log(`Summarizing ${activities.length} filtered activities...`);
      try {
        return await summarizer.summarizeActivities(activities);
      } catch (error) {
        console.error("Error during summarization:", error);
        return activities;
      }
    }
    return activities;
  }
}
