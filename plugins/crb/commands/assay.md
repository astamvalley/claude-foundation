---
description: >
  코드를 다각도로 리뷰한다. 파일, diff, 또는 코드를 받아
  아키텍처, 로직, 보안 3개 에이전트가 병렬로 검토하고 종합 진단을 출력한다.
argument-hint: '[파일경로 | diff | "코드"]'
skills:
  - crb-output
  - crb-team
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

## 플래그 파싱

- `--team`: Team 모드 즉시 실행
- `--solo`: Solo 모드 즉시 실행
- `--ref <session_id>`: 이전 assay 세션과 비교 (미해결 이슈 추적)

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

### ① 리뷰 대상 수집

대상 코드/diff를 읽어 컨텍스트에 로드한다. 파일이 너무 크면 (>500줄) 사용자에게 범위를 좁힐 것을 안내한다.

### ② Round 1 — 3개 리뷰어 독립 병렬 분석

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

### ③ Round 2 — 교차검증 (병렬)

Round 1 완료 후, 3개 에이전트를 다시 **동시에** 실행한다. 이번에는 각 에이전트가 자신의 분석 결과가 아닌 **나머지 두 에이전트의 결과**를 입력으로 받는다:

| 에이전트 | 입력 | 검토 목표 |
|---------|------|----------|
| Agent A | B의 결과 + C의 결과 | B·C가 놓친 아키텍처 문제, B+C 조합 시 발생하는 새로운 이슈 |
| Agent B | A의 결과 + C의 결과 | A·C가 놓친 로직 버그, A+C 조합 시 발생하는 새로운 이슈 |
| Agent C | A의 결과 + B의 결과 | A·B가 놓친 보안 취약점, A+B 조합 시 발생하는 복합 취약점 |

교차검증 프롬프트 구조:
```
다음은 다른 두 리뷰어의 분석 결과다:

[리뷰어 X 결과]
...

[리뷰어 Y 결과]
...

이 두 분석을 함께 읽으면서:
1. 두 리뷰어가 모두 놓친 <내 렌즈> 관점의 문제가 있는가?
2. 두 분석을 조합했을 때 단독으로는 보이지 않던 복합 이슈가 있는가?
   (예: X의 XSS + Y의 세션 로깅 = 공격 체인 가능성)
3. 두 리뷰어의 발견 중 심각도를 상향 조정해야 할 항목이 있는가?

발견한 것만 간결하게 출력하라. 없으면 "교차 발견 없음"으로 종료.
```

### ④ 종합 및 INLINE_COMMENTS

Round 1 + Round 2 결과를 통합한다.

**Verdict 판정** (종합 시작 전 출력):
```
✅ Approved     — Critical·High 이슈 없음
⚠️ Changes Requested — Critical N건, High N건 발견
```
Critical/High가 하나라도 있으면 Changes Requested. Medium/Low만 있으면 Approved.

- **심각도별 이슈 목록**: 🔴 Critical / 🟡 High / 🟠 Medium / 🔵 Low
- **교차 발견 이슈**: Round 2에서만 드러난 복합 문제 (별도 강조)
- **심각도 상향 항목**: 교차검증으로 재분류된 이슈
- **즉시 수정 권고**: 바로 고쳐야 할 것들
- **선택적 개선**: 해도 좋지만 필수는 아닌 것들

**INLINE_COMMENTS**: 파일 경로가 있는 이슈는 `파일명:줄번호` 형식으로 위치를 명시한다:
```
src/auth.ts:42 — [High] 비밀번호 평문 로깅: console.log에서 req.body 전체 출력
src/auth.ts:87 — [Critical] SQL 인젝션 가능성: 파라미터 미검증 쿼리 직접 삽입
```
파일 위치를 특정할 수 없는 경우(코드 스니펫, diff 없이 텍스트 입력) INLINE_COMMENTS 섹션 생략.

**--ref 비교** (`--ref <session_id>`가 있을 때):
- 이전 세션의 `.crb/outputs/{session_id}.md`를 읽어 이슈 목록을 추출한다
- 이번 결과와 비교해 미해결 항목을 강조한다:
  ```
  ⚠️ 미해결 이슈 (이전 세션 crb-YYYYMMDD-HHMMSS에서 지적):
    - src/auth.ts:42 — [High] 비밀번호 평문 로깅 → 여전히 미해결
  ```

## 결과물 저장 (Solo)

`crb-output` 스킬 규칙에 따라 저장한다:

1. `.crb/outputs/{session_id}.md` 생성:

```markdown
# assay: <대상 파일명 또는 설명>

세션 ID: <session_id>
커맨드: assay
생성일: <날짜>
모드: solo
리뷰어: 아키텍처(Claude) / 로직(Codex|Claude) / 보안(Claude)
대상: <파일 경로 또는 설명>

## 실행 맥락

- **원본 입력**: "<인수 전체>"
- **리뷰 대상**: <파일 경로 또는 "직접 입력">
- **코드 라인 수**: <N줄>
- **참조 세션**: <session_id> | 없음

## Verdict

⚠️ Changes Requested — Critical 1건, High 1건

## INLINE_COMMENTS

src/auth.ts:42 — [High] 비밀번호 평문 로깅
src/auth.ts:87 — [Critical] SQL 인젝션 가능성

## 이슈 목록

### 🔴 Critical
...

### 🟡 High
...

### 🟠 Medium
...

### 🔵 Low
...

## 미해결 이슈 (--ref 사용 시)

...

## 리뷰어별 핵심 발견

### 아키텍처
...

### 로직/버그
...

### 보안
...

## 교차 발견

<!-- Round 2 교차검증에서만 드러난 복합 이슈 -->
...

## 즉시 수정 권고

1. ...

## 선택적 개선

...
```

2. `.crb/runs/run-log.jsonl`에 한 줄 append:
   ```json
   {"timestamp":"<ISO8601>","session_id":"crb-YYYYMMDD-HHMMSS","command":"assay","topic":"<대상>","status":"completed","mode":"solo","user_input":{"raw":"<원본 입력>","flags":[]},"reviewers":["claude-architecture","codex-logic","claude-security"],"ref_session":"<session_id>|null","output_file":".crb/outputs/<session_id>.md"}
   ```

---

## Team 모드 워크플로우

Agent Teams 기반 Teammate 교차 토론 리뷰.

### Teammate 구성

| Teammate | 모델 | 역할 |
|----------|------|------|
| Arch | Sonnet | 아키텍처·설계 관점 리뷰 |
| Logic | Sonnet | 로직·버그·엣지케이스 관점 리뷰 |
| Security | Sonnet | 보안 취약점 관점 리뷰 |

### ① Round 1 — Teammate 독립 병렬 리뷰

Arch, Logic, Security를 **동시에** 스폰한다 — 순차 실행 금지.

각 Teammate는 독립적으로 리뷰 완료 후 결과를 공유 Task에 기록한다.

### ② 교차 토론

Round 1 완료 후:
1. 각 Teammate가 다른 두 Teammate의 결과를 읽고 복합 이슈를 직접 토론한다
2. Lead(현재 세션)가 토론 수렴 감시:
   - 모든 Teammate가 응답 없으면 자동 수렴 처리
   - 3분 타임아웃 시 강제 수렴

### ③ Lead 종합 및 저장

Lead가 Round 1 + 교차 토론 결과를 종합한다:
- 심각도별 이슈 목록 (Critical / High / Medium / Low)
- INLINE_COMMENTS (Solo와 동일 형식)
- **--ref 비교** (Solo와 동일 로직)

결과물 저장 형식은 Solo와 동일, `"mode":"team"` 기록.

---

## Gotchas

- 3개 에이전트는 반드시 동시에 실행할 것 — 순차 실행 금지
- Codex 오류 시 Claude Agent(로직 전문가 페르소나)로 조용히 대체
- 이슈 없으면 "이슈 없음" 명시 — 빈 섹션 남기지 않기
- 스타일/포매팅 지적은 🔵 Low로만 — Critical/High 남용 금지
- 파일이 너무 크면 무조건 범위를 좁혀달라고 안내할 것
- --ref 세션 파일이 없으면 에러 없이 비교 없이 진행
- INLINE_COMMENTS는 파일 위치를 특정할 수 있을 때만 출력 — 위치 모르면 생략
