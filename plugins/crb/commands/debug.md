---
description: >
  에러 메시지나 버그를 분석한다. 에러, 스택 트레이스, 또는 증상 설명을
  받아 원인, 영향 범위, 수정 방향을 빠르게 도출한다.
argument-hint: '[에러메시지 | 파일경로 | "증상 설명"]'
skills:
  - crb-output
---

# debug

에러가 났을 때 빠르게 원인을 파악한다. 에러 메시지를 붙여넣으면 원인 분석, 영향 범위, 수정 방향을 3개 관점으로 나눠 도출한다.

## 입력 파싱

인수에 따라 분석 대상을 결정한다:

| 인수 | 동작 |
|------|------|
| 에러 메시지/스택 트레이스 (따옴표) | 해당 에러를 직접 분석 |
| 파일 경로 | 해당 파일 + 최근 에러 로그 참조 |
| 증상 설명 (따옴표) | 설명 기반으로 원인 추론 |
| (없음) | 안내 메시지 출력 |

인수 없이 실행 시:
```
분석할 에러를 입력하세요.
예: /crb:debug "TypeError: Cannot read properties of undefined"
    /crb:debug src/auth.ts
    /crb:debug "로그인 후 간헐적으로 500 에러 발생"
```

## 플래그 파싱

- `--team`: 무시됨. debug는 Solo 모드 고정. "debug는 속도 우선으로 Solo 모드로만 실행됩니다." 출력 후 Solo 진행

## 세션 초기화

`crb-output` 스킬 규칙에 따라 세션을 초기화한다:
- 세션 ID: `crb-{YYYYMMDD}-{HHMMSS}`
- `user_input.raw`에 원본 입력 기록
- `user_input.flags`에 감지된 플래그 목록 기록 (--team 등 무시된 플래그도 기록)
- `mode`: 항상 `"solo"`

## 실행 워크플로우

### ① 컨텍스트 수집

분석 전 가능한 컨텍스트를 수집한다:
- 파일 경로가 있으면 해당 파일 읽기
- 에러 메시지에서 파일명/라인 번호 추출 시 해당 파일 참조
- git diff 또는 최근 변경 사항 확인 (가능할 때)

### ② 3개 관점 병렬 분석

3개 에이전트를 **동시에** 실행한다 — 순차 실행 금지:

| 에이전트 | 담당 | 분석 내용 |
|---------|------|----------|
| Root Cause | Codex > Claude | 에러의 근본 원인, 트리거 조건, 재현 조건, 스택트레이스/로그 분석 |
| Impact | Gemini > Claude | 이 에러로 영향받는 다른 기능/모듈, 데이터 정합성 위험 |
| Fix | Claude | 즉각 수정 방법, 임시 우회책, 재발 방지 |

**Root Cause (Codex 우선):**
```bash
CODEX_COMPANION=$(find ~/.claude/plugins -name "codex-companion.mjs" 2>/dev/null | head -1)
[ -n "$CODEX_COMPANION" ] && node "$CODEX_COMPANION" task "<원인 분석 프롬프트>"
# 없으면: codex exec --full-auto "IMPORTANT: Non-interactive. <원인 분석 프롬프트>"
# Codex 없으면: Claude Agent (코드 분석 전문가 페르소나)
```

**Impact (Gemini 우선):**
```bash
printf '%s' "<영향 범위 분석 프롬프트>" | gemini -p "" -o text --approval-mode yolo
# Gemini 없으면: Claude Agent
```

**Fix:** Claude Agent

### ③ 교차 검증 및 통합

Lead가 3개 결과를 교차 검증 후 종합한다:
- Root Cause와 Fix가 정합성이 있는가 (원인과 수정이 맞는가)
- Impact 범위를 Fix가 모두 커버하는가
- **핵심 원인**: 한 줄 요약
- **수정 방법**: 즉시 적용 가능한 구체적 코드/설정 변경
- **확인 사항**: 수정 후 검증해야 할 것들

## 결과물 저장

`crb-output` 스킬 규칙에 따라 저장한다:

1. `.crb/outputs/{session_id}.md` 생성:

```markdown
# debug: <에러 또는 증상 요약>

세션 ID: <session_id>
커맨드: debug
생성일: <날짜>
대상: <에러 메시지 요약 또는 파일명>

## 실행 맥락

- **원본 입력**: "<인수 전체>"
- **참조 파일**: <파일 경로 또는 없음>

## 핵심 원인

...

## 상세 분석

### 원인
...

### 영향 범위
...

### 수정 방향
...

## 즉시 적용 수정

```<언어>
// 수정 코드
```

## 확인 사항

- [ ] ...

## 재발 방지

...
```

2. `.crb/runs/run-log.jsonl`에 한 줄 append:
   ```json
   {"timestamp":"<ISO8601>","session_id":"crb-YYYYMMDD-HHMMSS","command":"debug","mode":"solo","topic":"<에러 요약>","status":"completed","user_input":{"raw":"<원본 입력>","flags":[]},"output_file":".crb/outputs/<session_id>.md"}
   ```

## Gotchas

- 3개 에이전트는 반드시 동시에 실행할 것 — 순차 실행 금지
- 에러 메시지만 있고 코드 없어도 분석 시작할 것 — 코드 없다고 중단 금지
- 수정 방법은 반드시 구체적으로 — "확인해보세요" 수준 금지
- 빠른 진단이 목적 — cast/assay처럼 깊이 조절 옵션 없음
- Codex/Gemini 오류 시 Claude Agent로 조용히 대체하고 계속 진행
- 교차 검증에서 원인과 수정이 불일치하면 Fix를 재실행할 것
