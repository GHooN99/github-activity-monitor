import { beforeEach, describe, expect, it } from "vitest";
import {
  createActivitiesWithMissingRepo,
  createMockConfig,
  createMockSummarizer,
  createStandardTestActivities,
} from "../__tests__/test-utils";
import { ActivityItem } from "../models/activity";
import { ActivityProcessor } from "./activity-processor";

describe("ActivityProcessor", () => {
  let processor: ActivityProcessor;
  let testActivities: ActivityItem[];
  let mockConfig = createMockConfig();
  let mockSummarizer = createMockSummarizer();

  beforeEach(() => {
    setupTestEnvironment();
  });

  it("should group and filter activities by repository", async () => {
    const result = await processor.processForNotification(testActivities);

    // Each repo should have no more than maxItemsPerRun items
    expect(result.filter((item) => item.repo === "owner/repo1").length).toBeLessThanOrEqual(
      mockConfig.maxItemsPerRun
    );
    expect(result.filter((item) => item.repo === "owner/repo2").length).toBeLessThanOrEqual(
      mockConfig.maxItemsPerRun
    );

    // Total activities should not exceed repositories count * maxItemsPerRun
    const repos = [...new Set(testActivities.map((a) => a.repo))];
    expect(result.length).toBeLessThanOrEqual(repos.length * mockConfig.maxItemsPerRun);
  });

  it("should sort activities chronologically", async () => {
    const result = await processor.processForNotification(testActivities);

    for (let i = 1; i < result.length; i++) {
      const prevTime = new Date(result[i - 1].createdAt).getTime();
      const currTime = new Date(result[i].createdAt).getTime();
      expect(prevTime).toBeLessThanOrEqual(currTime);
    }
  });

  it("should not call summarizer when summarization is disabled", async () => {
    // Arrange
    mockConfig.summarizationEnabled = false;

    // Act
    await processor.processForNotification(testActivities);

    // Assert: Summarizer should not be called
    expect(mockSummarizer.summarizeActivities).not.toHaveBeenCalled();
  });

  it("should call summarizer when summarization is enabled", async () => {
    // Arrange
    mockConfig.summarizationEnabled = true;

    // Act
    await processor.processForNotification(testActivities);

    // Assert: Summarizer should be called
    expect(mockSummarizer.summarizeActivities).toHaveBeenCalled();
  });

  it("should return original activities when summarization fails", async () => {
    // Arrange: Enable summarization and simulate error
    mockConfig.summarizationEnabled = true;
    mockSummarizer = createMockSummarizer(true); // Set to fail

    // Update processor with new mocks
    processor = new ActivityProcessor({
      config: mockConfig,
      summarizer: mockSummarizer,
      patternMatchers: new Map(), // Empty Map for tests - no patterns to ignore
    });

    // Act
    const result = await processor.processForNotification(testActivities);

    // Assert: Summarizer should be called and original activities returned
    expect(mockSummarizer.summarizeActivities).toHaveBeenCalled();
    expect(result).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: expect.any(String) })])
    );
  });

  it("should exclude activities without repository", async () => {
    // Arrange: Add activities with missing or empty repo
    const activitiesWithMissingRepo = createActivitiesWithMissingRepo(testActivities);

    // Act
    const result = await processor.processForNotification(activitiesWithMissingRepo);

    // Assert: No activities without repo should be included
    expect(result.some((item) => !item.repo)).toBe(false);
  });

  function setupTestEnvironment() {
    // Reset mocks
    mockConfig = createMockConfig();
    mockSummarizer = createMockSummarizer();

    // Create processor instance
    processor = new ActivityProcessor({
      config: mockConfig,
      summarizer: mockSummarizer,
      patternMatchers: new Map(), // Empty Map for tests - no patterns to ignore
    });

    // Create test data
    testActivities = createStandardTestActivities();
  }
});
