import { describe, expect, it } from "vitest";
import { ActivityItem } from "../../models/activity";
import { PatternMatcher } from "./pattern-matcher";

describe("PatternMatcher", () => {
  const createMockActivity = (overrides?: Partial<ActivityItem>): ActivityItem => ({
    repo: "test/repo",
    sourceType: "discussion",
    id: "123",
    title: "Test Discussion",
    url: "https://github.com/test/repo/discussions/123",
    author: "test-user",
    createdAt: "2024-01-01T00:00:00Z",
    body: "This is a test body",
    ...overrides,
  });

  describe("shouldIgnore", () => {
    it("should not ignore activities when no patterns are provided", () => {
      const matcher = new PatternMatcher([]);
      const activity = createMockActivity();
      
      expect(matcher.shouldIgnore(activity)).toBe(false);
    });

    describe("URL/ID patterns", () => {
      it("should ignore activities matching discussion ID pattern", () => {
        const matcher = new PatternMatcher(["discussions/123"]);
        const activity = createMockActivity({
          url: "https://github.com/test/repo/discussions/123",
        });
        
        expect(matcher.shouldIgnore(activity)).toBe(true);
      });

      it("should ignore activities matching issue ID pattern", () => {
        const matcher = new PatternMatcher(["issues/456"]);
        const activity = createMockActivity({
          url: "https://github.com/test/repo/issues/456",
          sourceType: "issue",
        });
        
        expect(matcher.shouldIgnore(activity)).toBe(true);
      });

      it("should ignore activities matching pull request pattern", () => {
        const matcher = new PatternMatcher(["pull/789", "pulls/789"]);
        const activity1 = createMockActivity({
          url: "https://github.com/test/repo/pull/789",
          sourceType: "pull_request",
        });
        const activity2 = createMockActivity({
          url: "https://github.com/test/repo/pulls/789",
          sourceType: "pull_request",
        });
        
        expect(matcher.shouldIgnore(activity1)).toBe(true);
        expect(matcher.shouldIgnore(activity2)).toBe(true);
      });

      it("should not ignore activities with different ID", () => {
        const matcher = new PatternMatcher(["discussions/999"]);
        const activity = createMockActivity({
          url: "https://github.com/test/repo/discussions/123",
        });
        
        expect(matcher.shouldIgnore(activity)).toBe(false);
      });
    });

    describe("Author patterns", () => {
      it("should ignore activities from specified author", () => {
        const matcher = new PatternMatcher(["@event-bot"]);
        const activity = createMockActivity({
          author: "event-bot",
        });
        
        expect(matcher.shouldIgnore(activity)).toBe(true);
      });

      it("should ignore activities with partial author match", () => {
        const matcher = new PatternMatcher(["@bot"]);
        const activity = createMockActivity({
          author: "event-bot-2024",
        });
        
        expect(matcher.shouldIgnore(activity)).toBe(true);
      });

      it("should be case-insensitive for author patterns", () => {
        const matcher = new PatternMatcher(["@EVENT-BOT"]);
        const activity = createMockActivity({
          author: "event-bot",
        });
        
        expect(matcher.shouldIgnore(activity)).toBe(true);
      });

      it("should not ignore activities from different author", () => {
        const matcher = new PatternMatcher(["@event-bot"]);
        const activity = createMockActivity({
          author: "real-user",
        });
        
        expect(matcher.shouldIgnore(activity)).toBe(false);
      });
    });

    describe("Keyword patterns", () => {
      it("should ignore activities with keyword in title", () => {
        const matcher = new PatternMatcher(["이벤트"]);
        const activity = createMockActivity({
          title: "새로운 이벤트 공지",
        });
        
        expect(matcher.shouldIgnore(activity)).toBe(true);
      });

      it("should ignore activities with keyword in body", () => {
        const matcher = new PatternMatcher(["추첨"]);
        const activity = createMockActivity({
          body: "이번 달 추첨 이벤트가 진행됩니다.",
        });
        
        expect(matcher.shouldIgnore(activity)).toBe(true);
      });

      it("should be case-insensitive for keyword patterns", () => {
        const matcher = new PatternMatcher(["EVENT"]);
        const activity = createMockActivity({
          title: "New event announcement",
        });
        
        expect(matcher.shouldIgnore(activity)).toBe(true);
      });

      it("should not ignore activities without matching keywords", () => {
        const matcher = new PatternMatcher(["이벤트", "추첨"]);
        const activity = createMockActivity({
          title: "일반 토론",
          body: "기술적인 내용입니다.",
        });
        
        expect(matcher.shouldIgnore(activity)).toBe(false);
      });
    });

    describe("Multiple patterns", () => {
      it("should ignore activities matching any pattern", () => {
        const matcher = new PatternMatcher([
          "discussions/999",
          "@bot",
          "이벤트",
        ]);
        
        const activity1 = createMockActivity({
          url: "https://github.com/test/repo/discussions/999",
        });
        const activity2 = createMockActivity({
          author: "event-bot",
        });
        const activity3 = createMockActivity({
          title: "이벤트 공지",
        });
        
        expect(matcher.shouldIgnore(activity1)).toBe(true);
        expect(matcher.shouldIgnore(activity2)).toBe(true);
        expect(matcher.shouldIgnore(activity3)).toBe(true);
      });

      it("should not ignore activities not matching any pattern", () => {
        const matcher = new PatternMatcher([
          "discussions/999",
          "@bot",
          "이벤트",
        ]);
        
        const activity = createMockActivity({
          url: "https://github.com/test/repo/discussions/123",
          author: "real-user",
          title: "Technical Discussion",
          body: "Some technical content",
        });
        
        expect(matcher.shouldIgnore(activity)).toBe(false);
      });
    });
  });
});