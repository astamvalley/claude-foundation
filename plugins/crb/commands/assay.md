---
description: >
  코드를 다각도로 리뷰한다. 파일, diff, 또는 코드를 받아
  아키텍처, 로직, 보안 3개 에이전트가 병렬로 검토하고 종합 진단을 출력한다.
argument-hint: '[파일경로 | diff | "코드"]'
skills:
  - crb-output
---

# assay

도가니에서 금속 순도를 측정하듯 코드의 품질을 정밀 진단한다. 단일 관점의 코드리뷰가 아니라 3개 독립 리뷰어가 병렬로 검토한 뒤 종합한다.

## 입력 파싱

인수에 따라 리뷰 대상을 결정한다:

| 인수 | 동작 |
|------|------|
| 파일 경로 | 해당 파일 전체를 대상으로 |
| `--staged` | `git diff --cached` 결과를 대상으로 |
| `--diff` | `git diff` 결과를 대상으로 |
| 텍스트 (따옴표) | 입력 텍스트를 직접 대상으로 |
| (없음) | `git diff --cached` → `git diff` → 안내 메시지 순으로 시도 |

인수 없고 diff도 없을 때:
```
리뷰할 대상이 없습니다.
파일 경로, 코드, 또는 --staged / --diff 플래그를 사용하세요.
예: /crb:assay src/auth.ts
    /crb:assay --staged
    /crb:assay "function login() { ... }"
```

## 세션 초기화

`crb-output` 스킬 규칙에 따라 세션을 초기화한다:
- 세션 ID: `crb-{YYYYMMDD}-{HHMMSS}`
- `user_input.raw`에 원본 입력 기록

## 실행 워크플로우

### ① 리뷰 대상 수집

대상 코드/diff를 읽어 컨텍스트에 로드한다. 파일이 너무 크면 (>500줄) 사용자에게 범위를 좁힐 것을 안내한다.

### ② 3개 리뷰어 병렬 실행

3개 에이전트를 **동시에** 실행한다 — 순차 실행 금지:

| 에이전트 | 역할 | 검토 관점 |
|---------|------|----------|
| Agent A (아키텍처) | Claude Agent | API 계약, 레이어 분리, 추상화 수준, 의존성 방향, 확장성 |
| Agent B (로직/버그) | Codex 우선, 없으면 Claude Agent | 로직 오류, 엣지케이스 누락, 조건 누락, 예외 처리, 타입 안전성 |
| Agent C (보안) | Claude Agent (보안 전문가 페르소나) | 입력 검증, 인증/인가, 데이터 노출, 의존성 취약점 |

Codex 실행 우선순위 (Agent B):
1. Claude Code Codex 플러그인 런타임:
   ```bash
   CODEX_COMPANION=$(find ~/.claude/plugins -name "codex-companion.mjs" 2>/dev/null | head -1)
   [ -n "$CODEX_COMPANION" ] && node "$CODEX_COMPANION" task "<리뷰 프롬프트>"
   ```
2. Codex CLI: `codex exec --full-auto "IMPORTANT: Non-interactive. <리뷰 프롬프트>"`
3. Claude Agent (로직 버그 전문가 페르소나)

### ③ 종합

3개 결과를 통합한다:
- **심각도별 이슈 목록**: 🔴 Critical / 🟡 Warning / 🔵 Info
- **리뷰어 간 공통 발견**: 여러 에이전트가 동시에 지적한 항목
- **즉시 수정 권고**: 바로 고쳐야 할 것들
- **선택적 개선**: 해도 좋지만 필수는 아닌 것들

## 결과물 저장

`crb-output` 스킬 규칙에 따라 저장한다:

1. `.crb/outputs/{session_id}.md` 생성:

```markdown
# assay: <대상 파일명 또는 설명>

세션 ID: <session_id>
커맨드: assay
생성일: <날짜>
리뷰어: 아키텍처(Claude) / 로직(Codex|Claude) / 보안(Claude)
대상: <파일 경로 또는 설명>

## 실행 맥락

- **원본 입력**: "<인수 전체>"
- **리뷰 대상**: <파일 경로 또는 "직접 입력">
- **코드 라인 수**: <N줄>

## 이슈 목록

### 🔴 Critical
...

### 🟡 Warning
...

### 🔵 Info
...

## 리뷰어별 핵심 발견

### 아키텍처
...

### 로직/버그
...

### 보안
...

## 즉시 수정 권고

1. ...

## 선택적 개선

...
```

2. `.crb/runs/run-log.jsonl`에 한 줄 append:
   ```json
   {"timestamp":"<ISO8601>","session_id":"crb-YYYYMMDD-HHMMSS","command":"assay","topic":"<대상>","status":"completed","user_input":{"raw":"<원본 입력>","flags":[]},"reviewers":["claude-architecture","codex-logic","claude-security"],"output_file":".crb/outputs/<session_id>.md"}
   ```

## Gotchas

- 3개 에이전트는 반드시 동시에 실행할 것 — 순차 실행 금지
- Codex 오류 시 Claude Agent(로직 전문가 페르소나)로 조용히 대체
- 이슈 없으면 "이슈 없음" 명시 — 빈 섹션 남기지 않기
- 스타일/포매팅 지적은 🔵 Info로만 — Critical/Warning 남용 금지
- 파일이 너무 크면 무조건 범위를 좁혀달라고 안내할 것
