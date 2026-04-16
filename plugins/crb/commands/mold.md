---
description: >
  구현 전 기술 구조를 설계한다. 기능명 또는 설명을 받아
  아키텍처, 데이터 모델, 컴포넌트 구조, 엣지케이스를 다각도로 분석하고
  실행 가능한 설계 문서를 생성한다.
argument-hint: '<기능명 또는 설명>'
skills:
  - crb-detect
  - crb-explore
  - crb-output
  - crb-team
---

# mold

코드를 짜기 전에 구조의 틀을 잡는다. cast가 기획 방향을 정제한다면, mold는 구현 직전의 기술 설계를 다진다.

## 입력 파싱

인수로 기능명 또는 설명을 받는다. 인수 없이 실행 시:
```
설계할 기능을 입력하세요.
예: /crb:mold 유저 인증 시스템
    /crb:mold "결제 플로우 — Stripe 연동, 환불 처리 포함"
```

## 플래그 파싱

- `--team`: Team 모드 즉시 실행
- `--solo`: Solo 모드 즉시 실행
- `--depth quick|standard|deep`: 실행 깊이 지정 (생략 시 `standard`)

| depth | 동작 |
|-------|------|
| `quick` | ①scan → ②Explore(단축 프롬프트, 에이전트당 핵심 3가지) → ③Synthesize(간략, ASCII 다이어그램 생략 가능) |
| `standard` | 전체 3단계 (기본값) |
| `deep` | ②Explore에서 에이전트당 추가 반복 분석, ③Synthesize에서 트레이드오프 깊이 확장 |

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

### ① 코드베이스 스캔 (기존 프로젝트일 때)

구현 대상 파일이 속한 디렉토리에서 `crb-detect` 스킬 규칙으로 언어/프레임워크를 감지한다. 추가로:
- 파일 트리 상위 2단계 탐색 (전체 구조 파악)
- 네이밍 컨벤션, 에러 처리 패턴, 폴더 구조 파악
- 감지 결과를 설계에 반영 (기존 패턴과 일관성 유지)

신규 프로젝트이거나 감지 결과가 없으면 이 단계를 조용히 건너뛴다.

### ② Explore — 3개 렌즈 병렬 분석

`crb-explore` 스킬 규칙에 따라 3개 에이전트를 **동시에** 실행한다. 렌즈는 아래로 고정한다:

| 에이전트 | 렌즈 | 분석 관점 |
|---------|------|----------|
| Agent A | 아키텍처 | 전체 구조, 레이어 분리, 의존성, 확장성 |
| Agent B | 데이터 모델 | 엔티티, 관계, 상태 흐름, 스키마 설계 |
| Agent C | 엣지케이스 | 실패 시나리오, 경계 조건, 동시성, 롤백 |

모델 감지 (`crb-explore` 스킬 규칙):
- Codex/Gemini 인증 시 해당 모델 사용
- 없으면 Claude Agent로 조용히 대체

3개 결과를 컨텍스트에 보관한다.

### ③ Synthesize — 설계 통합

Explore 3개 결과를 바탕으로 설계를 통합한다:

**권장 구조**: 합의된 아키텍처 + 데이터 모델 요약 (ASCII 다이어그램 포함)

**결정 필요 항목**: 렌즈 간 의견이 갈리는 설계 선택지 (트레이드오프 포함)

**불확실성/리스크**: 설계 결정별로 "이 결정이 틀릴 수 있는 경우"를 명시. forge/smelt 실행 시 주의 지점으로 전달

**위험 요소**: 엣지케이스 분석에서 도출된 주의사항

**즉시 실행 가능한 다음 단계**: 구현 시작을 위한 1-3개 액션

## 결과물 저장

`crb-output` 스킬 규칙에 따라 저장한다:

1. `.crb/outputs/{session_id}.md` 생성:

```markdown
# mold: <기능명>

세션 ID: <session_id>
커맨드: mold
생성일: <날짜>
모드: solo
대상: <기능명 또는 설명>

## 실행 맥락

- **원본 입력**: "<인수 전체>"
- **언어/프레임워크**: TypeScript / Next.js (crb-detect)
- **렌즈**: 아키텍처 / 데이터 모델 / 엣지케이스

## 의사결정 경로

- 아키텍처 렌즈: <핵심 제안 요약>
- 데이터 모델 렌즈: <핵심 제안 요약>
- 엣지케이스 렌즈: <핵심 발견 요약>

## 권장 구조

```
[ASCII 아키텍처 다이어그램]
Controller → Service → Repository → DB
               ↓
            EventBus → Notification
```

## 데이터 모델

...

## 결정 필요 항목

| 항목 | 선택지 A | 선택지 B | 트레이드오프 |
|------|---------|---------|-------------|

## 불확실성/리스크

| 설계 결정 | 틀릴 수 있는 경우 |
|----------|----------------|
| ...      | ...            |

## 위험 요소

...

## 구현 스펙

<!-- forge/smelt이 이 섹션을 파싱해 구현을 시작한다 -->

### 파일 구조

```
src/
  payment/
    service.ts    — 비즈니스 로직
    types.ts      — 인터페이스/타입
    repository.ts — DB 접근
```

### 주요 인터페이스

```typescript
// 주요 타입 정의 예시
```

## 다음 단계

1. ...
```

2. `.crb/runs/run-log.jsonl`에 한 줄 append:
   ```json
   {"timestamp":"<ISO8601>","session_id":"crb-YYYYMMDD-HHMMSS","command":"mold","topic":"<기능명>","status":"completed","mode":"solo","user_input":{"raw":"<원본 입력>","flags":[]},"output_file":".crb/outputs/<session_id>.md"}
   ```

---

## Team 모드 워크플로우

Agent Teams 기반 설계 토론.

### Teammate 구성

| Teammate | 모델 | 역할 |
|----------|------|------|
| Architect | Sonnet | 전체 구조·레이어·확장성 관점 |
| DataModel | Sonnet | 엔티티·관계·스키마·상태 흐름 관점 |
| EdgeCase | Haiku | 실패 시나리오·경계 조건·동시성 관점 |

### ① 코드베이스 스캔

Solo 모드와 동일하게 `crb-detect` 스킬로 환경 감지 후 Teammate에게 컨텍스트를 공유한다.

### ② Teammate 독립 병렬 설계

Architect, DataModel, EdgeCase를 **동시에** 스폰한다.

### ③ 설계 토론

각 Teammate가 다른 두 Teammate의 결과를 읽고 설계 선택지를 직접 토론한다.
Lead가 3분 타임아웃 감시.

### ④ Lead 종합 및 저장

Lead가 토론 결과를 바탕으로 Solo와 동일한 출력 형식으로 종합한다. `"mode":"team"` 기록.

---

## Gotchas

- 3개 에이전트는 반드시 동시에 실행할 것 — 순차 실행 금지
- cast와 달리 Frame/Challenge 단계 없음 — Explore → Synthesize로 직행
- 렌즈는 항상 아키텍처/데이터모델/엣지케이스로 고정 — 동적 선택 금지
- 설계 제안은 구체적이고 즉시 구현 가능한 수준으로 작성할 것
- 불확실성/리스크 섹션은 생략하지 말 것 — forge에 주의 지점 전달용
- `## 구현 스펙` 섹션은 생략하지 말 것 — forge/smelt가 이 섹션을 파싱한다
- Codex/Gemini 실행 오류 시 Claude Agent로 조용히 대체하고 계속 진행
