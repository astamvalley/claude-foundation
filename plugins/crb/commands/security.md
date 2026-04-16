---
description: >
  코드, 기능, 또는 설계의 보안 취약점을 점검한다.
  OWASP Top 10, 인증/인가 흐름, 데이터 노출 3개 렌즈로 병렬 분석한다.
argument-hint: '[파일경로 | 기능명 | "설명"]'
skills:
  - crb-output
  - crb-team
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

## 플래그 파싱

- `--team`: Team 모드 즉시 실행
- `--solo`: Solo 모드 즉시 실행
- `--ref <session_id>`: 이전 security 세션과 비교 (미해결 취약점 추적)

## 모드 결정

`crb-team` 스킬의 규칙에 따라 Solo/Team 모드를 결정한다.

- **Solo 모드**: 아래 [Solo 모드 워크플로우](#solo-모드-워크플로우) 진행
- **Team 모드**: 아래 [Team 모드 워크플로우](#team-모드-워크플로우) 진행

## 세션 초기화

`crb-output` 스킬 규칙에 따라 세션을 초기화한다:
- 세션 ID: `crb-{YYYYMMDD}-{HHMMSS}`
- `user_input.raw`에 원본 입력 기록
- `mode`에 결정된 모드 기록

## Solo 모드 워크플로우

### ① Round 1 — 3개 보안 렌즈 독립 병렬 분석

3개 에이전트를 **동시에** 실행한다 — 순차 실행 금지:

| 에이전트 | 렌즈 | 검토 관점 |
|---------|------|----------|
| Agent A | OWASP Top 10 | Injection, XSS, CSRF, 취약한 의존성, 보안 설정 오류 등 |
| Agent B | 인증/인가 흐름 | 세션 관리, 토큰 저장, 권한 검사 누락, 인증 우회 가능성 |
| Agent C | 데이터 노출 | 민감 정보 로깅, 응답 과다 노출, 암호화 미적용, 환경변수 노출 |

모든 에이전트는 Claude Agent (보안 전문가 페르소나)로 실행한다.

### ② Round 2 — 교차검증 (병렬)

Round 1 완료 후, 3개 에이전트를 다시 **동시에** 실행한다. 각 에이전트는 **나머지 두 에이전트의 결과**를 입력으로 받아 교차 분석한다:

| 에이전트 | 입력 | 검토 목표 |
|---------|------|----------|
| Agent A (OWASP) | B의 결과 + C의 결과 | 인증/데이터 문제가 OWASP 공격으로 연결되는 체인 발견 |
| Agent B (인증/인가) | A의 결과 + C의 결과 | OWASP 취약점 + 데이터 노출이 인증 우회로 이어지는 경로 발견 |
| Agent C (데이터 노출) | A의 결과 + B의 결과 | OWASP + 인증 취약점 조합 시 데이터 노출 규모 재평가 |

교차검증 프롬프트 구조:
```
다음은 다른 두 보안 렌즈의 분석 결과다:

[렌즈 X 결과]
...

[렌즈 Y 결과]
...

이 두 분석을 함께 읽으면서:
1. 두 취약점이 연결되면 <내 렌즈> 관점에서 더 심각한 공격 체인이 되는가?
   (예: XSS + 세션 토큰 미암호화 = 세션 탈취 → Critical 에스컬레이션)
2. 두 렌즈가 모두 놓친 <내 렌즈> 고유의 취약점이 있는가?
3. 기존 심각도 분류 중 상향 조정이 필요한 항목이 있는가?

발견한 것만 간결하게 출력하라. 없으면 "교차 발견 없음"으로 종료.
```

### ③ 취약점 통합 및 우선순위

Round 1 + Round 2 결과를 통합한다:
- **심각도 분류**: 🔴 Critical (즉시 수정) / 🟡 High / 🟠 Medium / 🔵 Low
- **공격 체인**: 교차검증으로 발견된 복합 취약점 (별도 강조)
- **심각도 상향 항목**: Round 2에서 재분류된 이슈
- **수정 방법**: 각 취약점에 대한 구체적 수정 방향

**INLINE_COMMENTS**: 파일 경로가 있는 취약점은 `파일명:줄번호` 형식으로 위치를 명시한다:
```
src/auth.ts:42 — [Critical] SQL 인젝션: 파라미터 미검증 쿼리 직접 삽입
src/api/user.ts:88 — [High] 민감 정보 응답 과다 노출: password 필드 포함
```

**--ref 비교** (`--ref <session_id>`가 있을 때):
- 이전 세션의 `.crb/outputs/{session_id}.md`를 읽어 취약점 목록을 추출한다
- 미해결 취약점 강조:
  ```
  ⚠️ 미해결 취약점 (이전 세션 crb-YYYYMMDD-HHMMSS에서 지적):
    - src/auth.ts:42 — [Critical] SQL 인젝션 → 여전히 미해결
  ```

## 결과물 저장 (Solo)

`crb-output` 스킬 규칙에 따라 저장한다:

1. `.crb/outputs/{session_id}.md` 생성:

```markdown
# security: <대상>

세션 ID: <session_id>
커맨드: security
생성일: <날짜>
모드: <solo | team>
대상: <파일 경로 또는 설명>
렌즈: OWASP Top 10 / 인증·인가 / 데이터 노출

## 실행 맥락

- **원본 입력**: "<인수 전체>"
- **점검 대상**: <파일 경로 또는 설명>
- **참조 세션**: <session_id> | 없음

## INLINE_COMMENTS

src/auth.ts:42 — [Critical] SQL 인젝션
src/api/user.ts:88 — [High] 민감 정보 응답 노출

## 취약점 목록

### 🔴 Critical
...

### 🟡 High
...

### 🟠 Medium
...

### 🔵 Low
...

## 미해결 취약점 (--ref 사용 시)

...

## 렌즈별 발견

### OWASP Top 10
...

### 인증/인가 흐름
...

### 데이터 노출
...

## 공격 체인 (교차 발견)

<!-- Round 2 교차검증에서만 드러난 복합 취약점/공격 경로 -->
...

## 수정 우선순위

1. ...

## 이상 없음 항목

...
```

2. `.crb/runs/run-log.jsonl`에 한 줄 append:
   ```json
   {"timestamp":"<ISO8601>","session_id":"crb-YYYYMMDD-HHMMSS","command":"security","topic":"<대상>","status":"completed","mode":"<solo|team>","user_input":{"raw":"<원본 입력>","flags":[]},"lenses":["owasp","auth-flow","data-exposure"],"ref_session":"<session_id>|null","output_file":".crb/outputs/<session_id>.md"}
   ```

### forge 연결

완료 후 Critical/High 취약점이 있을 때 선택지를 출력한다:

```
🔴 Critical 1건, 🟡 High 2건이 발견되었습니다.

> forge로 취약점 수정 실행
> 완료 (직접 수정)
```

forge 선택 시: 발견된 취약점 목록을 `forge`에 컨텍스트로 전달하고 `--no-git-check` 없이 실행한다. (취약점 없거나 Low만 있으면 선택지 생략)

---

## Team 모드 워크플로우

Agent Teams 기반 Teammate 공격 체인 토론.

### Teammate 구성

| Teammate | 모델 | 렌즈 |
|----------|------|------|
| OWASP | Sonnet | OWASP Top 10 |
| AuthFlow | Sonnet | 인증/인가 흐름 |
| DataExp | Sonnet | 데이터 노출 |

### ① Round 1 — Teammate 독립 병렬 분석

OWASP, AuthFlow, DataExp를 **동시에** 스폰한다 — 순차 실행 금지.

### ② 공격 체인 토론

Round 1 완료 후:
1. 각 Teammate가 다른 두 Teammate의 결과를 읽고 공격 체인 가능성을 직접 토론한다
2. Lead가 토론 수렴 감시 (3분 타임아웃)

### ③ Lead 종합 및 저장

Lead가 결과를 종합한다. forge 연결 선택지는 Solo와 동일하게 제공.
결과물 저장 형식은 Solo와 동일, `"mode":"team"` 기록.

---

## Gotchas

- 3개 에이전트는 반드시 동시에 실행할 것 — 순차 실행 금지
- 취약점 없을 때도 "이상 없음 항목" 섹션에 점검한 내용을 명시할 것
- 코드 없이 기능 설명만 받은 경우 잠재적 설계 취약점 관점으로 분석
- Critical은 실제로 악용 가능한 취약점에만 붙일 것 — 남용 금지
- --ref 세션 파일이 없으면 에러 없이 비교 없이 진행
- INLINE_COMMENTS는 파일 위치를 특정할 수 있을 때만 출력
