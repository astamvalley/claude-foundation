---
description: >
  mold → forge → assay를 자동으로 체이닝한다. 기능 명세를 주면
  설계 → 구현 → 리뷰 전 과정을 한 번에 실행한다.
  완료 후 assay 결과에 따라 수정 여부를 결정한다.
argument-hint: '"기능 명세" [--holdout "숨길 요구사항"] [--no-rollback]'
skills:
  - crb-detect
  - crb-forge
  - crb-output
  - crb-resume
  - crb-team
---

# smelt

제련(製鍊)하듯 원석(명세)을 완성품(코드)으로 가공한다.  
mold(설계) → forge(구현) → assay(리뷰)를 자동으로 체이닝한다.

## 플래그 파싱

- `--holdout "<항목>"`: 지정된 요구사항을 숨겨두고 구현 완료 후 blind 테스트 (v2.2.0+, 현재 미구현)
- `--no-rollback`: 스냅샷/rollback 비활성화 (v2.2.0+, 현재 미구현)
- `--team`: 내부 커맨드들을 Team 모드로 실행
- `--solo`: 내부 커맨드들을 Solo 모드로 실행

## 입력 파싱

인수 없이 실행 시:
```
구현할 기능을 입력하세요.
예: /crb:smelt "파일 업로드 컴포넌트 — 드래그앤드롭, 프리뷰, 진행률"
    /crb:smelt "결제 API — Stripe 연동, 환불 처리"
```

## 세션 초기화

`crb-output` 스킬 규칙에 따라 초기화한다:
- 세션 ID: `crb-{YYYYMMDD}-{HHMMSS}`
- 중단된 세션 감지: `crb-resume` 스킬 규칙에 따라 체크포인트 확인

## 워크플로우

### ① mold — 설계

mold를 실행한다 (`--pipeline` 없음 — mold는 사용자 확인 없이 자동 진행):

- `crb-detect`로 프로젝트 컨텍스트 감지
- 3개 렌즈 병렬 분석 (아키텍처/데이터모델/엣지케이스)
- 결과를 `.crb/outputs/{session_id}-mold.md`에 저장

완료 후 체크포인트 저장:
```json
{"completed_steps": ["mold"], "next_step": "forge", "context": {"mold_output": "<경로>"}}
```

요약 출력:
```
✅ mold 완료 — 설계 저장됨: .crb/outputs/{session_id}-mold.md
```

### ② forge — 구현

forge를 `--pipeline --no-git-check` 플래그로 실행한다:
- mold 세션 ID를 참조
- 완료 후 선택지 없이 결과만 반환 (`--pipeline`)
- git 브랜치 확인 건너뜀 (`--no-git-check`)

완료 후 체크포인트 업데이트:
```json
{"completed_steps": ["mold", "forge"], "next_step": "assay", "context": {"forge_output": "<경로>"}}
```

요약 출력:
```
✅ forge 완료 — 구현됨: <생성 파일 목록>
```

### ③ assay — 리뷰

방금 생성된 파일들에 대해 assay를 실행한다.

**Verdict 판정:**

```
Approved (Critical/High 이슈 없음) →
  ✅ smelt 완료
  결과: .crb/outputs/{session_id}.md
  생성됨: <파일 목록>

Changes Requested (Critical/High 이슈 있음) →
  assay 결과를 출력하고 선택지를 제시:

  ⚠️ assay에서 이슈가 발견되었습니다.
  Critical: N건  High: N건

  > forge로 이슈 수정 후 assay 재실행
  > debug로 이슈 분석
  > 수동으로 수정 (smelt 종료)
```

forge 재실행 선택 시: forge를 `--pipeline`으로 재실행 (assay 이슈 목록을 컨텍스트로 전달). 최대 2회까지 재시도.

### ④ 결과물 저장

`crb-output` 스킬 규칙에 따라 저장한다:

1. `.crb/outputs/{session_id}.md` 생성 (smelt 전체 실행 요약)
2. `.crb/runs/run-log.jsonl`에 한 줄 append
3. 체크포인트 파일 삭제
4. 완료 출력:
   ```
   결과 저장됨: .crb/outputs/{session_id}.md
   ```

## Gotchas

- forge는 반드시 `--pipeline` 플래그로 호출 — 완료 선택지가 smelt 흐름을 중단하지 않도록
- forge는 반드시 `--no-git-check` 플래그로 호출 — smelt 시작 시 git 검사 한 번으로 충분
- assay Verdict는 Critical/High 이슈 유무로만 판정 — Medium/Low는 Approved 처리
- forge 재시도는 최대 2회 — 무한 루프 방지
- 체크포인트는 각 단계 완료 시 즉시 저장 — 완료 시 삭제
- run-log.jsonl 기록은 smelt 전체 완료 시 한 번만 append
