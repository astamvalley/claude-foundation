# claude-foundation

Claude Code 및 agentskills.io 호환 에이전트를 위한 Agent Skills 모음입니다.

## 설치

```bash
# 특정 스킬 설치
npx skills add https://github.com/astamvalley/claude-foundation --skill create-skill -a claude-code
```

## 스킬 목록

| 스킬 | 설명 |
|------|------|
| [create-skill](skills/create-skill/) | agentskills.io 스펙 기반 스킬 제작 가이드 |

## 구조

```
claude-foundation/
└── skills/
    └── create-skill/
        ├── SKILL.md
        ├── references/
        └── assets/
```

## 호환 도구

Claude Code, Cursor, VS Code Copilot, Gemini CLI 등 [agentskills.io](https://agentskills.io) 호환 도구에서 사용 가능합니다.
