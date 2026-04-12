---
name: crb-output
description: crb 결과 저장 내부 스킬. state.json 형식, 출력 파일 구조(실행 맥락 + 의사결정 경로 포함), 파일 경로 규칙을 정의한다.
user-invocable: false
---

# crb-output

cast 커맨드의 결과 저장 단계에서만 사용한다.

## 세션 ID 생성

cast 시작 시 세션 ID를 생성한다:

```
crb-{YYYYMMDD}-{HHMMSS}
예: crb-20260412-143022
```

## state.json 형식

작업 디렉토리의 `.crb/state.json`에 기록한다. 파일이 없으면 생성, 있으면 업데이트한다.

```json
{
  "last_updated": "ISO 8601 타임스탬프",
  "session_id": "crb-YYYYMMDD-HHMMSS",
  "topic": "사용자가 입력한 주제",
  "status": "running | completed | interrupted",
  "current_phase": "explore | frame | design | challenge | done",
  "phases_completed": [],
  "user_input": {
    "raw": "사용자의 원본 입력 전체",
    "flags": ["--auto", "--background"]
  },
  "explore": {
    "config": {
      "agent_a": "claude",
      "agent_b": "codex | gemini | claude",
      "agent_c": "gemini | claude"
    },
    "lenses": ["렌즈1", "렌즈2", "렌즈3"]
  },
  "phases": {
    "frame": {
      "consensus": [],
      "tensions": [],
      "user_feedback": [],
      "iterations": 0
    },
    "design": {
      "chosen_direction": "",
      "rejected_alternatives": []
    },
    "challenge": {
      "reviewer": "codex | claude",
      "main_objection": "",
      "resolution": "수정됨 | 주의사항으로 포함"
    }
  },
  "output_file": ".crb/outputs/{session_id}.md"
}
```

**업데이트 규칙**: 각 phase 완료 시마다 `current_phase`, `phases_completed`, `last_updated`를 갱신한다. 완료 시 `status`를 `completed`로 변경한다.

## 출력 파일 경로

`.crb/outputs/{session_id}.md` 에 저장한다.

디렉토리가 없으면 생성한다:
```bash
mkdir -p .crb/outputs
```

## 출력 파일 구조

```markdown
# crucible: <주제>

세션 ID: <session_id>
생성일: <날짜>
렌즈: <렌즈1> / <렌즈2> / <렌즈3>
Explore 구성: <Agent A> / <Agent B> / <Agent C>

## 실행 맥락

- **원본 입력**: "<사용자가 입력한 전체 텍스트>"
- **실행 플래그**: <--auto, --background 등 사용한 플래그>

## 의사결정 경로

<!-- Frame에서 발생한 합의/충돌과 사용자 피드백, Design 방향 선택 이유, Challenge 처리 방식을 순서대로 기록 -->

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

**실행 맥락**과 **의사결정 경로** 섹션은 생략하지 않는다. 나중에 파일만 읽어도 전체 과정을 파악할 수 있어야 한다.
