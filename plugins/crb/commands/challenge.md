---
description: >
  Design 또는 기획 결과물에 대해 Challenge(적대적 리뷰)만 독립 실행한다.
  기존 cast 출력 파일이나 주제를 직접 입력받아 반론과 리스크를 도출한다.
argument-hint: '[session-id | 파일경로 | "주제"]'
skills:
  - crb-output
---

# challenge

cast 전체를 다시 실행하지 않고 Challenge 단계만 독립적으로 실행한다.

## 입력 파싱

인수에 따라 리뷰 대상을 결정한다:

| 인수 | 동작 |
|------|------|
| `crb-YYYYMMDD-HHMMSS` (세션 ID) | `.crb/outputs/{session_id}.md` 파일을 대상으로 |
| 파일 경로 (`.md` 등) | 해당 파일을 대상으로 |
| 텍스트 (따옴표 포함) | 입력 텍스트를 직접 대상으로 |
| (없음) | 가장 최근 cast 출력 파일 사용 |

인수 없이 실행 시 `.crb/runs/run-log.jsonl`의 마지막 항목에서 출력 파일을 찾는다. 파일도 없으면:
```
리뷰할 대상이 없습니다.
세션 ID, 파일 경로, 또는 주제를 입력하세요.
예: /crb:challenge crb-20260412-143022
    /crb:challenge "우리 앱의 인증 설계"
```

## 리뷰 실행

Codex 실행 우선순위:

1. **Claude Code Codex 플러그인 런타임** (최우선):
   ```bash
   CODEX_COMPANION=$(find ~/.claude/plugins -name "codex-companion.mjs" 2>/dev/null | head -1)
   if [ -n "$CODEX_COMPANION" ]; then
     node "$CODEX_COMPANION" task "<리뷰 프롬프트>"
   fi
   ```

2. **Codex CLI** (플러그인 없을 때):
   ```bash
   codex exec --full-auto "IMPORTANT: Non-interactive subagent. Do not ask questions. <리뷰 프롬프트>"
   ```

3. **Claude Agent** (Codex 전혀 없을 때): "회의적인 시니어 리뷰어" 페르소나로 스폰한다.

**리뷰 프롬프트 구조:**
```
아래 내용을 비판적으로 검토해줘. 반론과 리스크를 도출하는 것이 목적이야.

[대상 내용]

리뷰 관점:
- 이 계획이 실패하는 가장 가능성 높은 시나리오
- 간과한 가정이나 리스크
- 해소되지 않은 긴장점이나 미결 결정
```

## 결과물 저장

`crb-output` 스킬의 규칙에 따라 저장한다:

1. 세션 ID 생성 (`crb-{YYYYMMDD}-{HHMMSS}`)
2. `.crb/outputs/{session_id}.md` 생성:

```markdown
# challenge: <대상 제목 또는 주제>

세션 ID: <session_id>
커맨드: challenge
생성일: <날짜>
리뷰어: <codex-companion | codex-cli | claude>
대상: <파일 경로 또는 입력 텍스트 요약>

## 실행 맥락

- **원본 입력**: "<인수 전체>"
- **리뷰 대상**: <파일 경로 또는 "직접 입력">

## Challenge 결과

### 실패 시나리오

...

### 간과된 가정 및 리스크

...

### 미해소 긴장점

...

## 권고사항

...
```

3. `.crb/runs/run-log.jsonl`에 한 줄 append (`crb-output` 스킬 표준 필드 포함):
   ```json
   {"timestamp":"<ISO8601>","session_id":"crb-YYYYMMDD-HHMMSS","command":"challenge","topic":"<대상 제목>","status":"completed","user_input":{"raw":"<원본 입력>","flags":[]},"reviewer":"<codex-companion|codex-cli|claude>","output_file":".crb/outputs/<session_id>.md"}
   ```

## Gotchas

- 리뷰어는 반론을 도출하는 것이 목적 — 대상을 무너뜨리는 게 아님
- 대상 파일이 없으면 에러 없이 안내 메시지만 출력
- Codex 실행 오류 시 Claude Agent로 조용히 대체하고 계속 진행
