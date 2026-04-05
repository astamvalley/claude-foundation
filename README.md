# claude-foundation

Claude Code를 위한 Skills · Plugins 모음입니다.

## Skills

| 스킬 | 설명 |
|------|------|
| [create-skill](skills/create-skill/) | agentskills.io 스펙 기반 새 스킬 제작 |
| [auto-commit](skills/auto-commit/) | 변경사항을 분석해 커밋 메시지 자동 생성 및 커밋 실행 |
| [configure-notifications](skills/configure-notifications/) | macOS 시스템 알림 · Slack 웹훅 알림 설정 |

## Plugins

Claude Code에 설치해 사용하는 서드파티 플러그인을 정리합니다.

| 플러그인 | 설명 |
|----------|------|
| codex | Claude Code 안에서 Codex로 코드 리뷰를 받거나 작업을 위임하는 플러그인 (OpenAI) |

## 설치

```bash
# 전체 스킬 설치
npx skills add astamvalley/claude-foundation

# 특정 스킬만 설치
npx skills add astamvalley/claude-foundation --skill create-skill -a claude-code
npx skills add astamvalley/claude-foundation --skill auto-commit -a claude-code
npx skills add astamvalley/claude-foundation --skill configure-notifications -a claude-code
```

## 구조

```
claude-foundation/
├── skills/
│   ├── create-skill/
│   ├── auto-commit/
│   └── configure-notifications/
└── site/          # Skills · Plugins 브라우저 (Next.js)
```

## 호환 도구

Claude Code, Cursor, VS Code Copilot, Gemini CLI 등 [agentskills.io](https://agentskills.io) 호환 도구에서 사용 가능합니다.
