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

- `--holdout "<항목>"`: 지정된 요구사항을 숨겨두고 구현 완료 후 blind 테스트. 통과율을 만족도 점수에 반영 (+25%)
- `--no-rollback`: 스냅샷/rollback 비활성화
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

## 사전 스냅샷 (--no-rollback 없을 때)

`--no-rollback`이 없으면 smelt 시작 전 스냅샷을 저장한다:

```bash
# git 저장소인 경우
git rev-parse HEAD 2>/dev/null
# → HEAD SHA를 .crb/runs/smelt-snapshot.json에 기록

# git 아닌 경우
# 수정 예정 파일 목록 확인 후 .crb/snapshots/{session_id}/ 에 원본 복사
```

## 워크플로우

### ① git 안전 검사

forge에서 사용하는 것과 동일한 git 안전 검사를 smelt 시작 시 한 번 실행한다:

```bash
git rev-parse --is-inside-work-tree 2>/dev/null
```

- git 저장소이고 미커밋 변경사항이 있으면 브랜치 생성 여부를 묻는다 (forge의 git 안전 검사 로직 준용)
- 이후 ② mold, ③ forge(`--no-git-check`)에서는 git 검사를 건너뛴다

---

### ② mold — 설계

mold를 실행한다 (`--pipeline` 없음 — mold는 사용자 확인 없이 자동 진행):

- `crb-detect`로 프로젝트 컨텍스트 감지
- 3개 렌즈 병렬 분석 (아키텍처/데이터모델/엣지케이스)
- 결과를 `.crb/outputs/{session_id}-mold.md`에 저장
- smelt에 `--team` 플래그가 있으면 `--team`을, `--solo`가 있으면 `--solo`를 함께 전달한다

완료 후 체크포인트 저장:
```json
{"completed_steps": ["mold"], "next_step": "forge", "context": {"mold_output": "<경로>"}}
```

요약 출력:
```
✅ mold 완료 — 설계 저장됨: .crb/outputs/{session_id}-mold.md
```

### ③ forge — 구현

forge를 `--pipeline --no-git-check` 플래그로 실행한다:
- mold 세션 ID를 참조
- 완료 후 선택지 없이 결과만 반환 (`--pipeline`)
- git 브랜치 확인 건너뜀 (`--no-git-check`)
- smelt에 `--team` 플래그가 있으면 `--team`을, `--solo`가 있으면 `--solo`를 함께 전달한다

완료 후 체크포인트 업데이트:
```json
{"completed_steps": ["mold", "forge"], "next_step": "assay", "context": {"forge_output": "<경로>"}}
```

요약 출력:
```
✅ forge 완료 — 구현됨: <생성 파일 목록>
```

### ④ assay — 리뷰

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

**자율 재시도 (--no-rollback 없을 때):**

만족도 점수를 아래 기준으로 측정한다:

| 항목 | 비중 | 측정 방법 |
|------|:----:|----------|
| 행동 충족 | 40% | assay Critical/High 이슈 수 감소 여부 — 이번 시도 이슈 수 < 이전 시도 이슈 수 |
| 제약 준수 | 30% | mold에서 명시한 불확실성/리스크 항목 중 새로 위반된 것이 없는가 |
| 품질 유지 | 30% | assay Medium 이슈가 증가하지 않았는가 |

```
각 항목을 0~1로 평가 후 가중 합산:
  이번 점수 < 이전 점수 → rollback 후 사용자에게 선택지:
    "자동 수정이 품질을 개선하지 못했습니다. 원본 상태로 복원했습니다."
    > forge로 수동 수정
    > debug로 이슈 분석
    > smelt 종료

  이번 점수 >= 이전 점수 → forge --pipeline 재시도 (최대 2회)
```

**rollback 실행:**
- git 저장소: `git reset --hard {snapshot SHA}` 제안 (사용자 확인 후 실행)
- git 아닌 경우: `.crb/snapshots/{session_id}/`에서 원본 파일 복원

**--holdout 동작 (플래그 있을 때):**

```
1. smelt가 --holdout 항목을 제외한 나머지 요구사항으로 구현 진행
2. 구현 완료 후 숨겨뒀던 항목으로 blind 테스트 실행
3. 통과율을 만족도 점수에 반영 (+25% 보너스, 나머지 항목 비중 조정)
```

### ⑤ 결과물 저장

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
- `--team`/`--solo`는 mold·forge 호출 시 반드시 전달할 것 — 전달 누락 시 자식 커맨드가 Solo로 실행됨
- `--holdout` 항목은 mold에 전달하는 명세에서 반드시 제거할 것 — mold/forge 단계에서 절대 노출 금지
- assay Verdict는 Critical/High 이슈 유무로만 판정 — Medium/Low는 Approved 처리
- forge 재시도는 최대 2회 — 무한 루프 방지
- 체크포인트는 각 단계 완료 시 즉시 저장 — 완료 시 삭제
- run-log.jsonl 기록은 smelt 전체 완료 시 한 번만 append
- rollback은 반드시 사용자 확인 후 실행 — git reset --hard는 파괴적 연산
