---
description: >
  다각도 분석과 합의 수렴으로 기획을 정제하는 메인 워크플로우를 실행한다.
  게임 기획, 앱 설계, 아키텍처 결정, 프로덕트 방향 등 어떤 기획 주제에도 사용 가능하다.
  /crb:cast <주제> 또는 /crb:cast --auto <주제> 로 호출한다.
  단순 질문이나 코딩 작업에는 사용하지 않는다.
skills:
  - crb-explore
  - crb-frame
  - crb-output
  - crb-team
---

# cast

주어진 주제를 4단계 워크플로우로 정제해 `.crb/outputs/{session_id}.md`에 저장한다.

## 플래그 파싱

입력에서 플래그를 감지한다:

- `--team`: Team 모드 즉시 실행
- `--solo`: Solo 모드 즉시 실행
- `--auto`: Frame 후 사람 확인 없이 끝까지 자동 실행
- `--background`: 백그라운드 Task로 실행
- `--wait`: 포그라운드 강제 실행
- `--depth quick|standard|deep`: 실행 깊이 지정 (생략 시 선택 요청)
- `--lens <A>,<B>,<C>`: 렌즈 직접 지정 (생략 시 자동 선택)
- `--ref <session_id>`: 이전 cast 세션 결과를 컨텍스트로 참조. 해당 세션의 `.crb/outputs/{session_id}.md`를 읽어 이전 합의·긴장점을 Explore 프롬프트에 포함한다. 연속된 기획 반복 시 이전 결과를 발전시킬 수 있다
- 플래그 없음: 기본값 (모드 및 깊이 선택 요청)

## 모드 결정

`crb-team` 스킬의 규칙에 따라 Solo/Team 모드를 결정한다. 결정된 모드를 컨텍스트에 기록한다.

- **Solo 모드**: 아래 [Solo 모드 워크플로우](#solo-모드-워크플로우) 진행
- **Team 모드**: 아래 [Team 모드 워크플로우](#team-모드-워크플로우) 진행

## 실행 방식 결정

`--background` 또는 `--wait`가 없을 때, `AskUserQuestion`으로 정확히 1회 묻는다:

```
crb:cast는 4단계(Explore → Frame → Design → Challenge)로 진행됩니다.
완료까지 시간이 걸릴 수 있습니다.

> 백그라운드로 실행  (Recommended)
> 지금 기다리기
```

- 백그라운드 선택 → 백그라운드 Task로 실행하고 아래를 출력:
  ```
  crb:cast가 백그라운드에서 실행됩니다.
  완료되면 알림이 옵니다. 결과는 .crb/outputs/ 에 저장됩니다.
  ```
- 포그라운드 선택 → 그대로 진행

`--auto`와 `--background`를 함께 쓸 수 있다.

## 깊이 결정

`--depth`가 없을 때, `AskUserQuestion`으로 정확히 1회 묻는다:

```
어떤 깊이로 진행할까요?

> standard — 전체 4단계 (Recommended)
> quick    — Explore + Frame만 (빠른 초안)
> deep     — 각 단계 심층 반복
```

| depth | 동작 |
|-------|------|
| `quick` | Explore → Frame → 결과 저장. Design·Challenge 생략 |
| `standard` | Explore → Frame → Design → Challenge (기본값) |
| `deep` | 각 phase에서 관점 추가 반복. Frame 합의 기준 강화 |

`--auto`와 함께 쓸 때 `--depth`가 없으면 `standard`로 자동 결정한다.

## 세션 초기화

워크플로우 시작 전에 `crb-output` 스킬의 규칙에 따라 세션 ID를 생성하고 실행 데이터를 컨텍스트에 초기화한다:

- 세션 ID 생성: `crb-{YYYYMMDD}-{HHMMSS}`
- `user_input.raw` 에 원본 입력 전체를 기록
- `user_input.flags` 에 감지된 플래그 목록을 기록
- `mode`: 모드 결정 단계에서 확정된 값 (`"solo"` | `"team"`)
- 실행 중 수집한 데이터는 완료 시 `crb-output` 스킬 규칙에 따라 `.crb/runs/run-log.jsonl`에 한 줄 append

---

## Solo 모드 워크플로우

### ① Explore — 병렬 다각도 분석

`crb-explore` 스킬의 규칙에 따라 실행한다:

1. 모델 감지 (Codex/Gemini 인증 확인)
2. 구성 결정 및 사용자에게 한 줄 알림
3. `--lens` 플래그가 있으면 해당 렌즈 사용, 없으면 주제 기반 동적 선택
4. 3개 에이전트 병렬 실행 — 순차 실행 금지 (`--depth deep`이면 에이전트당 추가 반복 실행)
5. 결과를 컨텍스트에 보관 (explore.config, explore.lenses)

---

### ② Frame — 합의 수렴

`crb-frame` 스킬의 규칙에 따라 실행한다:

1. Explore 3개 결과를 합의 영역 / 부분 합의 / 긴장점으로 정리 (`--depth deep`이면 합의 기준 강화)
2. `--auto` 없을 때: 사용자 확인 및 피드백 루프 (2회 이상 시 강제 진행 옵션 제시)
3. `--auto` 있을 때: 요약 출력 후 자동 진행
4. 결과를 컨텍스트에 보관 (phases.frame.consensus, tensions, user_feedback, iterations)

---

### ③ Design — 구체 방향 제시

Frame 결과를 바탕으로 실행 가능한 방향을 제시한다:

- **권장 방향**: 합의 영역 기반, 구체적 액션 포함
- **결정 필요 항목**: 긴장점에 대한 선택지 2-3개 + 트레이드오프
- **다음 단계**: 즉시 실행 가능한 1-3개 액션

완료 후 컨텍스트에 보관:
- `phases.design.chosen_direction`: 선택된 방향 요약
- `phases.design.rejected_alternatives`: 검토했으나 제외된 방향들

---

### ④ Challenge — 적대적 리뷰

Design 결과를 비판적으로 검토한다.

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

리뷰 관점:
- 이 계획이 실패하는 가장 가능성 높은 시나리오
- 간과한 가정이나 리스크
- Design이 Frame의 긴장점을 제대로 해소했는가

Challenge 결과에 따라 Design을 수정하거나 최종 출력에 "주의사항"으로 포함한다.

완료 후 컨텍스트에 보관:
- `phases.challenge.reviewer`: 사용한 리뷰어
- `phases.challenge.main_objection`: 핵심 반론
- `phases.challenge.resolution`: 처리 방식

---

### ⑤ 결과물 저장

`crb-output` 스킬의 규칙에 따라 저장한다:

1. `.crb/outputs/{session_id}.md` 생성 (실행 맥락 + 의사결정 경로 섹션 포함)
2. `.crb/runs/run-log.jsonl`에 실행 기록 한 줄 append:
   ```json
   {"timestamp":"<ISO8601>","session_id":"crb-YYYYMMDD-HHMMSS","command":"cast","mode":"solo","topic":"<주제>","status":"completed","user_input":{"raw":"<원본 입력>","flags":[]},"explore":{"config":{"agent_a":"claude","agent_b":"codex","agent_c":"gemini"},"lenses":["<렌즈1>","<렌즈2>","<렌즈3>"]},"phases":{"frame":{"consensus":[],"tensions":[]},"design":{"chosen_direction":"<선택 방향>"},"challenge":{"reviewer":"<codex|gemini|claude>","resolution":"<처리 방식>"}},"output_file":".crb/outputs/<session_id>.md"}
   ```
3. 저장 경로 출력:
   ```
   결과 저장됨: .crb/outputs/{session_id}.md
   ```

---

## Team 모드 워크플로우

Agent Teams 실험 기능을 사용한 Teammate 기반 병렬 토론 워크플로우.

### Teammate 구성

| Teammate | 모델 | 역할 |
|----------|------|------|
| Lens-A | Haiku | 렌즈 1 분석 |
| Lens-B | Haiku | 렌즈 2 분석 |
| Lens-C | Haiku | 렌즈 3 분석 |
| Critic | Sonnet | Challenge 전담 (`--depth standard` 이상) |

### ① Explore — Teammate 병렬 탐색

Lens-A, Lens-B, Lens-C를 **동시에** 스폰한다 — 순차 실행 금지.

- `--lens` 플래그가 있으면 해당 렌즈 지정, 없으면 주제 기반 동적 선택 (`crb-explore` 스킬 규칙 준수)
- 각 Teammate는 자신의 렌즈 관점으로 주제를 분석하고 결과를 공유 Task에 기록한다
- `--depth deep`이면 각 Teammate 추가 반복 실행

결과를 컨텍스트에 보관: `explore.config`, `explore.lenses`

### ② 토론 — Frame 대체

**crb-frame 스킬을 사용하지 않는다.** Teammate 간 직접 토론이 Frame 단계를 대체한다.

Lens-A,B,C Explore 완료 후:
1. Lens-A,B,C가 서로의 결과를 읽고 합의점·긴장점을 직접 토론한다
2. 수렴 제어:
   - **TeammateIdle Hook**: 모든 Teammate가 응답 없으면 자동 수렴 처리
   - **5분 타임아웃**: 타임아웃 시 Lead(현재 세션)가 강제 수렴
   - **`--auto` 있을 때**: 2라운드 후 자동 강제 수렴
3. `--auto` 없을 때: 토론 요약 출력 후 사용자 확인 요청 (Solo 모드 Frame과 동일 형식)

결과를 컨텍스트에 보관:
- `phases.frame.consensus`, `phases.frame.tensions`
- `phases.frame.mode`: `"team"`
- `phases.frame.discussion_rounds`: 실제 토론 라운드 수

### ③ Design — Lead 종합

Lead(현재 세션)가 Teammate 토론 결과를 기반으로 실행 가능한 방향을 제시한다.

Solo 모드 Design과 동일한 출력 구조:
- **권장 방향**: 합의 영역 기반, 구체적 액션 포함
- **결정 필요 항목**: 긴장점에 대한 선택지 2-3개 + 트레이드오프
- **다음 단계**: 즉시 실행 가능한 1-3개 액션

완료 후 컨텍스트에 보관:
- `phases.design.chosen_direction`
- `phases.design.rejected_alternatives`

### ④ Challenge — Critic Teammate

`--depth standard` 이상이면 Critic (Sonnet) Teammate가 Design을 비판적으로 검토한다.

`--depth quick`이면 Challenge 생략.

Critic 리뷰 관점:
- 이 계획이 실패하는 가장 가능성 높은 시나리오
- Teammate 토론에서 간과된 가정이나 리스크
- Design이 긴장점을 제대로 해소했는가

Challenge 결과에 따라 Design을 수정하거나 최종 출력에 "주의사항"으로 포함한다.

완료 후 컨텍스트에 보관:
- `phases.challenge.reviewer`: `"critic-teammate"`
- `phases.challenge.main_objection`
- `phases.challenge.resolution`

### 결과물 저장

Solo 모드 결과물 저장과 동일하게 `crb-output` 스킬 규칙에 따라 처리한다. run-log.jsonl 형식은 Solo와 동일하며 `"mode":"team"` 기록:
```json
{"timestamp":"<ISO8601>","session_id":"crb-YYYYMMDD-HHMMSS","command":"cast","mode":"team","topic":"<주제>","status":"completed","user_input":{"raw":"<원본 입력>","flags":[]},"phases":{"frame":{"consensus":[],"tensions":[],"discussion_rounds":2},"design":{"chosen_direction":"<선택 방향>"},"challenge":{"reviewer":"critic-teammate","resolution":"<처리 방식>"}},"output_file":".crb/outputs/<session_id>.md"}
```

---

## Gotchas

- Explore Agent들은 반드시 동시에 실행할 것 — 순차 실행 금지
- 렌즈는 매번 주제에 맞게 새로 선택할 것 — 고정 렌즈 재사용 금지
- Codex/Gemini 실행 오류는 에러로 표시하지 말고 Claude로 조용히 대체할 것
- Frame에서 합의가 없어도 진행할 것 — 긴장점 자체가 Design의 재료
- Challenge는 Design을 무너뜨리는 게 목적이 아님 — 더 단단하게 만드는 것
- run-log.jsonl 기록은 완료 시 한 번만 append할 것 — 중간에 쓰지 않음
- 실행 맥락과 의사결정 경로 섹션은 출력에서 생략하지 말 것
- --ref 세션 파일이 없으면 에러 없이 --ref 없이 진행
- Team quick과 Solo quick은 다르다 — Solo quick은 Design·Challenge 모두 생략, Team quick은 Design을 수행하고 Challenge만 생략 (Team은 토론 자체가 Frame+α이므로 Design 단계가 더 가볍게 처리됨)
