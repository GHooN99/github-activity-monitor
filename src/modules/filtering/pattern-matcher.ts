import { ActivityItem } from "../../models/activity";

export interface IPatternMatcher {
  shouldIgnore(activity: ActivityItem): boolean;
}

export class PatternMatcher implements IPatternMatcher {
  private readonly patterns: string[];

  public constructor(patterns: string[] = []) {
    this.patterns = patterns;
  }

  public shouldIgnore(activity: ActivityItem): boolean {
    for (const pattern of this.patterns) {
      if (this.matchesPattern(activity, pattern)) {
        return true;
      }
    }
    return false;
  }

  private matchesPattern(activity: ActivityItem, pattern: string): boolean {
    // Author pattern: starts with @
    if (pattern.startsWith("@")) {
      const authorPattern = pattern.substring(1).toLowerCase();
      return activity.author.toLowerCase().includes(authorPattern);
    }

    // URL/ID pattern: contains common GitHub paths
    if (this.isUrlPattern(pattern)) {
      return this.matchesUrlPattern(activity.url, pattern);
    }

    // Default: keyword pattern (search in title and body)
    return this.matchesKeyword(activity, pattern);
  }

  private isUrlPattern(pattern: string): boolean {
    return (
      pattern.includes("discussions/") ||
      pattern.includes("issues/") ||
      pattern.includes("pull/") ||
      pattern.includes("pulls/")
    );
  }

  private matchesUrlPattern(activityUrl: string, pattern: string): boolean {
    // Normalize pattern: remove leading slash if present
    const normalizedPattern = pattern.startsWith("/") ? pattern.substring(1) : pattern;
    
    // Check if the activity URL contains the pattern
    return activityUrl.includes(normalizedPattern);
  }

  private matchesKeyword(activity: ActivityItem, keyword: string): boolean {
    const lowerKeyword = keyword.toLowerCase();
    
    // Check title
    if (activity.title && activity.title.toLowerCase().includes(lowerKeyword)) {
      return true;
    }
    
    // Check body if present
    if (activity.body && activity.body.toLowerCase().includes(lowerKeyword)) {
      return true;
    }
    
    return false;
  }
}