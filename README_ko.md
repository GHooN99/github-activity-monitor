# GitHub Activity Monitor

강력한 공개 GitHub 저장소 활동 추적 도구로, 선택적 AI 기반 요약 및 알림 기능을 제공합니다.

_[English version](./README.md)_

## 개요

GitHub Activity Monitor는 소유하지 않은 공개 GitHub 저장소에서도 의미 있는 토론, PR, 이슈 및 댓글을 추적할 수 있게 해줍니다. 관심 있는 저장소에 웹훅 접근 권한이 없는 문제를 직접 활동을 가져와 모니터링함으로써 해결합니다.

주요 기능:

- 공개 저장소의 토론, 이슈, 풀 리퀘스트 및 댓글 모니터링
- Gemini, OpenAI 또는 기타 LLM 제공업체를 사용한 AI 기반 요약
- Discord 또는 Slack으로 알림 전송
- 유연한 저장소 모니터링 옵션으로 추적 구성 가능
- 패턴을 사용한 원하지 않는 활동 필터링 (URL, 키워드, 작성자)

## 주의: 현재 구현 상태

**중요 사항**: 이 프로젝트는 아직 활발히 개발 중입니다. 현재 다음 기능만 완전히 구현되어 있습니다:

- Gemini AI 제공업체를 사용한 요약
- GitHub 토론 및 토론 댓글 모니터링
- Discord 알림

문서에 언급된 기타 기능은 향후 업데이트에서 구현될 예정입니다. 필요한 기능을 추가하기 위해 직접 인터페이스를 구현할 수도 있습니다.

## 설치

이 도구를 사용하는 두 가지 방법이 있습니다:

### 방법 1: 포크 및 구성 (권장)

1. 이 저장소를 GitHub 계정으로 포크합니다
2. **중요**: 포크한 저장소에 `state.json` 파일이 있는 경우 삭제하여 깨끗한 상태로 시작하세요
3. `.env` 및 `monitor.config.ts` 파일을 구성합니다
4. GitHub Actions 워크플로우를 설정합니다 (아래 참조)

### 방법 2: 로컬 설치

```bash
# 저장소 복제
git clone https://github.com/yourusername/github-activity-monitor.git
cd github-activity-monitor

# pnpm을 사용하여 의존성 설치
pnpm install

# 환경 변수 설정 (복사 후 편집)
cp .env.example .env
```

## 구성

### 환경 변수

다음 변수를 포함하는 `.env` 파일을 생성하세요:

```
MONITOR_GITHUB_PAT=your_github_pat
OPENAI_API_KEY=your_openai_api_key
GOOGLE_API_KEY=your_google_api_key
CLAUDE_API_KEY=your_claude_api_key
DISCORD_WEBHOOK_URL=your_discord_webhook_url
SLACK_WEBHOOK_URL=your_slack_webhook_url
```

**참고:** 최소한 `MONITOR_GITHUB_PAT`와 `DISCORD_WEBHOOK_URL` 또는 `SLACK_WEBHOOK_URL` 중 하나를 제공해야 합니다.

**GitHub PAT 생성 시 중요 사항**: GitHub 개인 액세스 토큰(PAT)을 생성할 때 모든 저장소 리소스에 대한 읽기 권한을 활성화해야 합니다. 특히 다음 권한이 필요합니다:

- 토론(Discussions) (읽기)
- 풀 리퀘스트(Pull Requests) (읽기)
- 이슈(Issues) (읽기)
- 콘텐츠(Contents) (읽기)
- 메타데이터(Metadata) (읽기)

이러한 권한이 없으면 모니터가 저장소에서 필요한 정보에 접근할 수 없습니다.

### 모니터 구성

모니터링 설정을 사용자 정의하려면 `monitor.config.ts` 파일을 편집하세요:

```typescript
export const config = {
  repoConfigs: [
    {
      name: "owner/repo",
      monitorTypes: ["discussion", "discussion_comment"],
      // 선택사항: 원하지 않는 활동 필터링
      ignorePatterns: [
        "discussions/123", // 특정 discussion ID 무시
        "이벤트", // "이벤트" 키워드 포함 활동 무시
        "@bot-name", // 특정 작성자의 활동 무시
      ],
    },
    // 필요에 따라 더 많은 저장소 추가
  ],
  stateFilePath: "state.json",
  maxItemsPerRun: 5,
  summarizationEnabled: true,
  llmProvider: "gemini", // 또는 "openai", "claude", "none"
  llmModelName: "gemini-2.0-flash-lite", // 또는 선호하는 모델
};
```

### 활동 필터링

저장소 구성에서 `ignorePatterns` 옵션을 사용하여 원하지 않는 활동을 필터링할 수 있습니다. 패턴은 형식에 따라 자동으로 감지됩니다:

- **URL/ID 패턴**: `discussions/123`, `issues/456`, `pull/789` - 특정 토론, 이슈 또는 PR 무시
- **작성자 패턴**: `@username` - 특정 사용자의 활동 무시 (`@` 접두사 사용)
- **키워드 패턴**: 일반 텍스트 - 제목이나 본문에 해당 키워드가 포함된 활동 무시

사용 예시:

- 이벤트 공지 필터링: "이벤트", "추첨", "참여" 같은 키워드 추가
- 봇 활동 무시: `@dependabot`, `@renovate-bot` 같은 패턴 사용
- 특정 토론 건너뛰기: URL에서 토론 ID 사용

## 사용법

### GitHub Actions 사용 (권장)

이 저장소에는 모니터를 일정에 따라 자동으로 실행하는 GitHub Actions 워크플로우가 포함되어 있습니다.

1. 이 저장소를 GitHub 계정으로 포크합니다
2. 포크한 저장소의 Settings > Secrets and variables > Actions로 이동합니다
3. 필요한 환경 변수를 저장소 시크릿으로 추가합니다:
   - `MONITOR_GITHUB_PAT`
   - `DISCORD_WEBHOOK_URL` 또는 `SLACK_WEBHOOK_URL`
   - 선택 사항: `GOOGLE_API_KEY`, `OPENAI_API_KEY`, 또는 `CLAUDE_API_KEY` (요약 기능용)
4. `.github/workflows/monitor.yml` 파일을 편집하여 일정을 사용자 정의합니다
5. 저장소 설정에서 GitHub Actions를 활성화합니다

모니터가 이제 정의한 일정에 따라 자동으로 실행됩니다.

### 로컬에서 실행

```bash
# 개발 모드에서 실행 (파일 변경 감시)
pnpm dev

# 프로젝트 빌드
pnpm build

# 프로덕션 모드에서 실행
pnpm start
```

또한 cron 작업 또는 예약된 작업을 설정하여 모니터를 주기적으로 실행할 수 있습니다:

```bash
# cron 작업 예시 (매시간 실행)
0 * * * * cd /path/to/github-activity-monitor && pnpm start > /path/to/logfile.log 2>&1
```

## 개발

### 프로젝트 구조

```
src/
├── configs/            # 구성 처리
├── core/               # 핵심 애플리케이션 로직
├── models/             # 데이터 모델 및 타입
└── modules/
    ├── activity-fetching/    # GitHub API 상호 작용
    ├── filtering/            # 활동 필터링 로직
    ├── http-client/          # HTTP 클라이언트 추상화
    ├── notification/         # Discord/Slack 알림
    ├── persistence/          # 파일 시스템 작업
    ├── state-management/     # 실행 간 상태 추적
    └── summarization/        # AI 요약 로직
```

### 주요 스크립트

```bash
# 테스트 실행
pnpm test

# 감시 모드에서 테스트 실행
pnpm test:watch

# 코드 린트
pnpm lint

# 린트 이슈 수정
pnpm lint:fix

# 코드 포맷
pnpm format
```

### 요구 사항

- Node.js >= 20.0.0
- pnpm >= 10.0.0 (권장 패키지 관리자)
- 유효한 GitHub 개인 액세스 토큰
- (선택 사항) OpenAI, Google(Gemini) 또는 Anthropic(Claude)용 API 키
- 알림을 위한 Discord 또는 Slack 웹훅 URL

## 기여

기여는 환영합니다! 풀 리퀘스트를 자유롭게 제출해 주세요.
