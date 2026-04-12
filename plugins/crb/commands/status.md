---
description: >
  crb 커맨드 실행 이력을 조회한다. cast, challenge 등 모든 crb 결과물의
  세션 ID, 주제, 상태, 완료 단계를 테이블로 보여준다.
argument-hint: '[N] [cast|challenge] [YYYY-MM-DD]'
allowed-tools: Bash, Read
---

# status

`.crb/runs/run-log.jsonl`을 읽어 crb 실행 이력을 표시한다.

## 실행 순서

### 1단계: run-log 확인

```bash
RUN_LOG=".crb/runs/run-log.jsonl"
if [[ -f "$RUN_LOG" ]]; then
    wc -l < "$RUN_LOG"
else
    echo "not-found"
fi
```

파일이 없으면 아래를 출력하고 종료한다:

```
아직 crb 실행 기록이 없습니다.
/crb:cast <주제> 로 시작하세요.
```

### 2단계: 인수 파싱

| 인수 | 동작 | 예시 |
|------|------|------|
| (없음) | 최근 10개 표시 | `/crb:status` |
| 숫자 N | 최근 N개 표시 | `/crb:status 20` |
| 커맨드명 | 해당 커맨드만 필터 | `/crb:status cast` |
| 날짜 (YYYY-MM-DD) | 해당 날짜만 필터 | `/crb:status 2026-04-12` |

인수 조합 가능: `/crb:status cast 2026-04-12`

### 3단계: 결과 표시

```bash
tail -10 ".crb/runs/run-log.jsonl"
```

결과를 아래 형식의 테이블로 출력한다:

```
crb 실행 이력 (최근 N개)
═══════════════════════════════════════════════════════════════════════
날짜         커맨드    주제                      상태          출력 파일
───────────────────────────────────────────────────────────────────────
2026-04-12   cast      CARRIER 방04 퍼즐 설계    completed     crb-20260412-143022.md
2026-04-11   cast      앱 아키텍처 설계          interrupted   crb-20260411-091500.md
2026-04-10   challenge CARRIER 방04 퍼즐 설계    completed     crb-20260410-110200.md
═══════════════════════════════════════════════════════════════════════
결과 열람: /crb:result <세션 ID>
```

- `status`가 `interrupted`인 항목은 어느 단계에서 중단됐는지 표시
- 출력 파일은 파일명만 표시 (경로 생략)

## Gotchas

- jq가 있으면 사용해 파싱. 없으면 Bash로 처리
- run-log.jsonl이 없거나 비어 있으면 안내 메시지만 출력하고 에러 없이 종료
