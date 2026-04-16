---
description: >
  crb 사용 통계를 출력한다. run-log.jsonl을 분석해 커맨드별 사용 횟수,
  모드 분포, 자주 쓰는 커맨드 순위를 보여준다.
skills:
  - crb-output
---

# stats

`.crb/runs/run-log.jsonl`을 파싱해 사용 패턴을 분석한다.

## 실행

```bash
[ -f ".crb/runs/run-log.jsonl" ] && cat .crb/runs/run-log.jsonl
```

파일이 없으면:
```
아직 실행 기록이 없습니다.
/crb:auto "하고 싶은 것을 설명해 주세요" 로 시작해 보세요.
```

## 출력 형식

```
─────────────────────────────────────────
📊 CRB 사용 통계
─────────────────────────────────────────
총 실행: N회

자주 쓴 커맨드:
  1. cast      12회  ████████████
  2. assay      8회  ████████
  3. forge      5회  █████
  4. debug      3회  ███
  5. mold       2회  ██

모드 분포:
  Solo  28회 (87%)
  Team   4회 (13%)

최근 실행:
  2026-04-16 14:32  forge  solo  결제 서비스 구현
  2026-04-16 11:20  assay  solo  src/payment/service.ts
  2026-04-15 09:15  cast   team  결제 플로우 기획
─────────────────────────────────────────
```

## Gotchas

- run-log.jsonl 파일 없으면 안내 메시지만 출력 — 에러 없이
- 최근 실행은 최대 5개만 표시
- auto 커맨드 실행은 라우팅된 커맨드 기준으로 집계: `command:"auto"` 항목은 `routed_to` 필드 값을 실제 커맨드로 사용
