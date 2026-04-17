---
name: crb-output
description: crb 결과 저장 내부 스킬. run-log.jsonl 형식, 출력 파일 구조(실행 맥락 + 의사결정 경로 포함), 파일 경로 규칙을 정의한다.
user-invocable: false
---

# crb-output

cast, challenge 등 결과를 생성하는 모든 crb 커맨드에서 사용한다.

## 디렉토리 구조

```
.crb/
  runs/
    run-log.jsonl               ← 모든 커맨드 실행 기록 (append-only)
    routing-corrections.jsonl   ← auto 라우팅 보정 사례 (append-only)
  outputs/
    crb-YYYYMMDD-HHMMSS.md      ← 커맨드별 출력 파일
```

디렉토리가 없으면 생성한다:
```bash
mkdir -p .crb/runs .crb/outputs
```

## 세션 ID 생성

커맨드 시작 시 세션 ID를 생성한다:

```
crb-{YYYYMMDD}-{HHMMSS}
예: crb-20260412-143022
```

## run-log.jsonl 형식

커맨드 완료(또는 중단) 시 `.crb/runs/run-log.jsonl`에 한 줄을 append한다.
실행 중에는 쓰지 않는다 — 컨텍스트에 보관하다가 완료 시 한 번에 기록한다.

```jsonl
{"timestamp":"2026-04-12T14:30:22Z","session_id":"crb-20260412-143022","command":"cast","mode":"solo","topic":"CARRIER 방04 퍼즐 설계","status":"completed","user_input":{"raw":"/crb:cast CARRIER 방04 퍼즐 설계","flags":["--auto"]},"explore":{"config":{"agent_a":"claude","agent_b":"codex","agent_c":"gemini"},"lenses":["플레이어 경험","메카닉 설계","서사·분위기"]},"phases":{"frame":{"consensus":["퍼즐은 환경의 일부여야 함"],"tensions":["힌트 시스템 필요 여부"],"user_feedback":[],"iterations":0},"design":{"chosen_direction":"환경 단서 기반, 힌트 없음","rejected_alternatives":["아이템 힌트"]},"challenge":{"reviewer":"codex","main_objection":"난이도 미검증","resolution":"주의사항으로 포함"}},"output_file":".crb/outputs/crb-20260412-143022.md"}
```

**JSONL 형식 규칙:** 한 줄에 JSON 객체 하나. 줄바꿈·들여쓰기 없이 한 줄로 출력한다 (pretty-print 금지).

**필드 규칙:**
- `command`: 실행된 커맨드명 (`cast`, `challenge` 등)
- `mode`: `"solo"` | `"team"` — crb-team 스킬이 결정한 모드
- `status`: `completed` | `interrupted`
- `explore`는 cast에만 해당. challenge 등 다른 커맨드는 생략 가능
- 중단된 경우 `status: "interrupted"`, 완료된 phase까지만 기록
- Team 모드인 경우 `team_config` 필드 추가 (선택):
  ```json
  "team_config": {
    "teammates": [
      {"name": "Lens-A", "model": "haiku", "role": "렌즈 1 분석"},
      {"name": "Lens-B", "model": "haiku", "role": "렌즈 2 분석"},
      {"name": "Critic", "model": "sonnet", "role": "Challenge"}
    ]
  }
  ```

## 출력 파일 경로

`.crb/outputs/{session_id}.md` 에 저장한다.

파일 저장 완료 후 Finder에서 해당 파일을 열어준다:

```bash
open -R ".crb/outputs/{session_id}.md"
```

## 출력 파일 구조

```markdown
# <command>: <주제>

세션 ID: <session_id>
커맨드: <cast | mold | forge | smelt | assay | security | challenge | debug>
생성일: <날짜>
렌즈: <렌즈1> / <렌즈2> / <렌즈3>
Explore 구성: <Agent A> / <Agent B> / <Agent C>

## 실행 맥락

- **원본 입력**: "<사용자가 입력한 전체 텍스트>"
- **실행 플래그**: <사용한 플래그>

## 의사결정 경로

- **Frame 합의**: <합의된 전제들>
- **Frame 긴장점**: <충돌 항목들> — <어떤 모델이 어떤 입장>
- **사용자 피드백** (N회): <피드백 내용>
- **Design 선택**: <선택한 방향> — <선택 이유>
- **Challenge 지적**: <주요 반론> → <처리 방식>

## 합의 영역

...

## 권장 방향

...

## 결정 필요 항목

...

## 다음 단계

...

## Challenge 리뷰

...

## 주의사항

...
```

**실행 맥락**과 **의사결정 경로** 섹션은 생략하지 않는다.

## mold 출력 파싱 규칙

mold 출력 파일(`.crb/outputs/{session_id}.md`)에는 반드시 `## 구현 스펙` 섹션이 포함된다:

```markdown
## 구현 스펙

- **진입점**: <파일명 또는 함수 시그니처>
- **의존성**: <외부 패키지 목록>
- **예상 파일**: <생성될 파일 목록>
- **인터페이스**: <주요 타입/API 정의>
```

forge/smelt는 mold 출력을 참조할 때 이 섹션을 우선 파싱해 구현 방향을 결정한다.
`## 구현 스펙` 섹션이 없으면 forge가 mini-mold를 실행해 보완한다.
