---
name: crb-resume
description: 긴 실행(smelt, cast --depth deep)의 체크포인트를 감지하고 중단된 실행을 재개한다.
user-invocable: false
---

# crb-resume

smelt, cast `--depth deep` 등 긴 실행에서 사용한다. 커맨드 시작 시 중단된 세션이 있는지 확인한다.

## 체크포인트 감지

커맨드 실행 시작 전에 아래를 확인한다:

```bash
ls .crb/runs/*-checkpoint.json 2>/dev/null
```

체크포인트 파일이 있으면:
1. 파일을 읽어 `saved_at` 필드를 확인한다
2. 24시간 이내 → 재개 선택지 제시
3. 24시간 초과 → 무시하고 처음부터 시작

## 체크포인트 파일 형식

```json
{
  "session_id": "crb-YYYYMMDD-HHMMSS",
  "command": "smelt",
  "completed_steps": ["mold"],
  "next_step": "forge",
  "context": {
    "mold_output": ".crb/outputs/crb-YYYYMMDD-HHMMSS.md"
  },
  "saved_at": "2026-04-14T14:32:00Z"
}
```

## 재개 선택지

`AskUserQuestion`으로 1회 묻는다:

```
이전 실행이 중단된 것을 발견했습니다 (crb-YYYYMMDD-HHMMSS, <완료된 단계> 완료 후 중단).

> 이어서 실행 (<다음 단계>부터)  (Recommended)
> 처음부터 다시 실행
```

- 이어서 실행 → 체크포인트의 `next_step`부터 진행
- 처음부터 → 체크포인트 파일 삭제 후 처음부터 시작

## 체크포인트 저장 규칙

각 단계 완료 시 `.crb/runs/{session_id}-checkpoint.json`을 덮어쓴다:

```
smelt: mold 완료 → completed_steps: ["mold"], next_step: "forge"
smelt: forge 완료 → completed_steps: ["mold", "forge"], next_step: "assay"
```

완료 시 자동 삭제:
```bash
rm .crb/runs/{session_id}-checkpoint.json
```

## Gotchas

- 24시간 초과 체크포인트는 조용히 무시한다 — 에러 없이
- 체크포인트 파일이 손상됐으면 (JSON 파싱 실패) 무시하고 처음부터 진행
- 재개 시 컨텍스트는 체크포인트의 `context` 필드에서 복원한다
- 완료 시 반드시 체크포인트 파일을 삭제한다
