---
description: >
  crb 커맨드의 출력 파일을 열람한다. 세션 ID를 지정하면 해당 결과를,
  생략하면 가장 최근 결과를 표시한다.
argument-hint: '[session-id]'
allowed-tools: Bash, Read
---

# result

`.crb/outputs/` 에 저장된 출력 파일을 열람한다.

## 실행 순서

### 1단계: 대상 파일 결정

**세션 ID를 인수로 받은 경우:**
```bash
cat ".crb/outputs/$ARGUMENTS.md"
```

**인수 없는 경우 — 가장 최근 결과:**
```bash
# run-log.jsonl의 마지막 줄에서 output_file 추출
tail -1 ".crb/runs/run-log.jsonl"
```

### 2단계: 파일 존재 확인

파일이 없으면:
```
세션 ID 'crb-XXXXXXXX-XXXXXX'의 결과 파일을 찾을 수 없습니다.
/crb:status 로 유효한 세션 ID를 확인하세요.
```

### 3단계: 출력

파일 전체 내용을 출력한다. 요약하거나 생략하지 않는다.

## Gotchas

- 인수가 없고 run-log.jsonl도 없으면: "아직 crb 실행 기록이 없습니다. /crb:cast <주제> 로 시작하세요." 출력 후 종료
- 세션 ID에 `.md` 확장자를 붙이지 않아도 동작해야 함 (`crb-20260412-143022` → `.crb/outputs/crb-20260412-143022.md`)
