---
description: >
  Design 또는 기획 결과물에 대해 Challenge(적대적 리뷰)만 독립 실행한다.
  기존 cast 출력 파일이나 주제를 직접 입력받아 반론과 리스크를 도출한다.
argument-hint: '[session-id | 파일경로 | "주제"]'
skills:
  - crb-output
  - crb-team
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

## 플래그 파싱

- `--team`: Team 모드 즉시 실행
- `--solo`: Solo 모드 즉시 실행

## 모드 결정

`crb-team` 스킬의 규칙에 따라 Solo/Team 모드를 결정한다.

- **Solo 모드**: 아래 [Solo 모드 워크플로우](#solo-모드-워크플로우) 진행
- **Team 모드**: 아래 [Team 모드 워크플로우](#team-모드-워크플로우) 진행

## 세션 초기화

`crb-output` 스킬 규칙에 따라 세션을 초기화한다:
- 세션 ID: `crb-{YYYYMMDD}-{HHMMSS}`
- `user_input.raw`에 원본 입력 기록
- `user_input.flags`에 감지된 플래그 목록 기록
- `mode`: 모드 결정 단계에서 확정된 값 (`"solo"` | `"team"`)

## Solo 모드 워크플로우

3개 에이전트를 **동시에** 실행한다 — 순차 실행 금지.

| 에이전트 | 담당 | 관점 |
|---------|------|------|
| TechSkeptic | Codex > Claude | 기술적 실현 가능성 — 이 설계가 실제로 동작하는가? |
| BizSkeptic | Gemini > Claude | 비즈니스/현실성 — 이 계획이 실제로 실행 가능한가? |
| RealityCheck | Claude | 사용자/운영 관점 — 현장에서 쓰면 어떤 일이 생기는가? |

에이전트별 실행:

**TechSkeptic (Codex 우선):**
```bash
CODEX_COMPANION=$(find ~/.claude/plugins -name "codex-companion.mjs" 2>/dev/null | head -1)
[ -n "$CODEX_COMPANION" ] && node "$CODEX_COMPANION" task "<기술 비판 프롬프트>"
# 없으면: codex exec --full-auto "IMPORTANT: Non-interactive. <기술 비판 프롬프트>"
# Codex 없으면: Claude Agent
```

**BizSkeptic (Gemini 우선):**
```bash
printf '%s' "<비즈니스 비판 프롬프트>" | gemini -p "" -o text --approval-mode yolo
# Gemini 없으면: Claude Agent
```

**RealityCheck:** Claude Agent ("현장 운영자" 페르소나)

**리뷰 프롬프트 공통 구조:**
```
아래 내용을 <관점>에서 비판적으로 검토해줘. 반론과 리스크를 도출하는 것이 목적이야.

[대상 내용]

리뷰 관점:
- 이 계획이 실패하는 가장 가능성 높은 시나리오
- 간과한 가정이나 리스크
- 해소되지 않은 긴장점이나 미결 결정

각 반론에 반박 난이도를 표시해줘: Easy / Hard / Very Hard
난이도 기준: Very Hard = 근본적인 설계 변경 없이는 해소 불가능
```

3개 결과 수집 후 Lead가 종합:
- "가장 치명적인 리스크 Top 3" 도출 (3개 에이전트 합의 기반)
- 반박 난이도 High/Very Hard 항목 우선 강조

## Team 모드 워크플로우

Agent Teams 기반 다관점 적대 토론.

### Teammate 구성

| Teammate | 모델 | 관점 |
|----------|------|------|
| TechSkeptic | Sonnet | 기술적 실현 가능성 |
| BizSkeptic | Haiku | 비즈니스/현실성 |
| RealityCheck | Haiku | 사용자/운영 |

### ① Teammate 독립 병렬 리뷰

TechSkeptic, BizSkeptic, RealityCheck를 **동시에** 스폰한다.

각 Teammate는 반박 난이도 포함 리뷰 완료 후 결과를 공유 Task에 기록한다.

### ② 교차 적대 토론

각 Teammate가 다른 두 Teammate의 반론을 읽고 반박하거나 강화한다.
Lead가 3분 타임아웃 감시.

### ③ Lead 종합

결과물 저장 형식은 Solo와 동일, `"mode":"team"` 기록.

## 결과물 저장

`crb-output` 스킬의 규칙에 따라 저장한다:

1. 세션 ID 생성 (`crb-{YYYYMMDD}-{HHMMSS}`)
2. `.crb/outputs/{session_id}.md` 생성:

```markdown
# challenge: <대상 제목 또는 주제>

세션 ID: <session_id>
커맨드: challenge
생성일: <날짜>
모드: solo | team
리뷰어: TechSkeptic(Codex) / BizSkeptic(Gemini) / RealityCheck(Claude)
대상: <파일 경로 또는 입력 텍스트 요약>

## 실행 맥락

- **원본 입력**: "<인수 전체>"
- **리뷰 대상**: <파일 경로 또는 "직접 입력">

## Challenge 결과

### 가장 치명적인 리스크 Top 3

1. [Very Hard] ...
2. [Hard] ...
3. [Hard] ...

### 실패 시나리오

...

### 간과된 가정 및 리스크

| 리스크 | 관점 | 반박 난이도 |
|--------|------|------------|
| ... | TechSkeptic | Very Hard |

### 미해소 긴장점

...

## 권고사항

...
```

3. `.crb/runs/run-log.jsonl`에 한 줄 append:
   ```json
   {"timestamp":"<ISO8601>","session_id":"crb-YYYYMMDD-HHMMSS","command":"challenge","topic":"<대상 제목>","status":"completed","mode":"solo|team","user_input":{"raw":"<원본 입력>","flags":[]},"reviewers":["tech-skeptic","biz-skeptic","reality-check"],"output_file":".crb/outputs/<session_id>.md"}
   ```

## Gotchas

- 3개 에이전트는 반드시 동시에 실행할 것 — 순차 실행 금지
- 반론을 도출하는 것이 목적 — 대상을 무너뜨리는 게 아님
- 반박 난이도는 반드시 표시할 것 — Very Hard 항목이 최우선 해결 대상
- 대상 파일이 없으면 에러 없이 안내 메시지만 출력
- Codex/Gemini 실행 오류 시 Claude Agent로 조용히 대체하고 계속 진행
