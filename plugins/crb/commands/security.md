---
description: >
  코드, 기능, 또는 설계의 보안 취약점을 점검한다.
  OWASP Top 10, 인증/인가 흐름, 데이터 노출 3개 렌즈로 병렬 분석한다.
argument-hint: '[파일경로 | 기능명 | "설명"]'
skills:
  - crb-output
---

# security

보안 점검 전용 커맨드. assay의 보안 렌즈만 깊게 파고든 버전으로, 인증·결제·개인정보 등 민감한 기능 완성 후 실행한다.

## 입력 파싱

인수에 따라 점검 대상을 결정한다:

| 인수 | 동작 |
|------|------|
| 파일 경로 | 해당 파일을 대상으로 |
| `--staged` | `git diff --cached` 결과를 대상으로 |
| `--diff` | `git diff` 결과를 대상으로 |
| 기능명/설명 (따옴표) | 설명 기반으로 잠재 취약점 분석 |
| (없음) | `git diff --cached` → `git diff` → 안내 메시지 |

## 세션 초기화

`crb-output` 스킬 규칙에 따라 세션을 초기화한다:
- 세션 ID: `crb-{YYYYMMDD}-{HHMMSS}`
- `user_input.raw`에 원본 입력 기록

## 실행 워크플로우

### ① 3개 보안 렌즈 병렬 분석

3개 에이전트를 **동시에** 실행한다 — 순차 실행 금지:

| 에이전트 | 렌즈 | 검토 관점 |
|---------|------|----------|
| Agent A | OWASP Top 10 | Injection, XSS, CSRF, 취약한 의존성, 보안 설정 오류 등 |
| Agent B | 인증/인가 흐름 | 세션 관리, 토큰 저장, 권한 검사 누락, 인증 우회 가능성 |
| Agent C | 데이터 노출 | 민감 정보 로깅, 응답 과다 노출, 암호화 미적용, 환경변수 노출 |

모든 에이전트는 Claude Agent (보안 전문가 페르소나)로 실행한다.

### ② 취약점 통합 및 우선순위

3개 결과를 통합한다:
- **심각도 분류**: 🔴 Critical (즉시 수정) / 🟡 High / 🟠 Medium / 🔵 Low
- **공통 발견**: 여러 렌즈에서 동시에 감지된 취약점
- **수정 방법**: 각 취약점에 대한 구체적 수정 방향

## 결과물 저장

`crb-output` 스킬 규칙에 따라 저장한다:

1. `.crb/outputs/{session_id}.md` 생성:

```markdown
# security: <대상>

세션 ID: <session_id>
커맨드: security
생성일: <날짜>
대상: <파일 경로 또는 설명>
렌즈: OWASP Top 10 / 인증·인가 / 데이터 노출

## 실행 맥락

- **원본 입력**: "<인수 전체>"
- **점검 대상**: <파일 경로 또는 설명>

## 취약점 목록

### 🔴 Critical
...

### 🟡 High
...

### 🟠 Medium
...

### 🔵 Low
...

## 렌즈별 발견

### OWASP Top 10
...

### 인증/인가 흐름
...

### 데이터 노출
...

## 수정 우선순위

1. ...

## 이상 없음 항목

...
```

2. `.crb/runs/run-log.jsonl`에 한 줄 append:
   ```json
   {"timestamp":"<ISO8601>","session_id":"crb-YYYYMMDD-HHMMSS","command":"security","topic":"<대상>","status":"completed","user_input":{"raw":"<원본 입력>","flags":[]},"lenses":["owasp","auth-flow","data-exposure"],"output_file":".crb/outputs/<session_id>.md"}
   ```

## Gotchas

- 3개 에이전트는 반드시 동시에 실행할 것 — 순차 실행 금지
- 취약점 없을 때도 "이상 없음 항목" 섹션에 점검한 내용을 명시할 것
- 코드 없이 기능 설명만 받은 경우 잠재적 설계 취약점 관점으로 분석
- Critical은 실제로 악용 가능한 취약점에만 붙일 것 — 남용 금지
