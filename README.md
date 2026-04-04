# claude-foundation

Claude Code 및 agentskills.io 호환 에이전트를 위한 Agent Skills 모음입니다.

## 스킬 목록

| 스킬 | 설명 |
|------|------|
| [create-skill](skills/create-skill/) | agentskills.io 스펙 기반 새 스킬 제작 |
| [auto-commit](skills/auto-commit/) | 변경사항을 분석해 커밋 메시지 자동 생성 및 커밋 실행 |
| [configure-notifications](skills/configure-notifications/) | macOS 시스템 알림 · Slack 웹훅 알림 설정 |

## 설치

```bash
# 전체 설치
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
└── site/          # skills.sh 스타일 스킬 브라우저 (Next.js)
```

## 호환 도구

Claude Code, Cursor, VS Code Copilot, Gemini CLI 등 [agentskills.io](https://agentskills.io) 호환 도구에서 사용 가능합니다.
