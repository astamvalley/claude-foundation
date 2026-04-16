---
description: >
  1구현 + 2리뷰로 코드를 구현한다. Implementer(Claude)가 코드를 작성하고
  Reviewer 1·2(Codex/Gemini/Claude)가 병렬로 리뷰한 뒤 2/3 합의 기준으로 피드백을 반영한다.
  mold 출력을 자동 참조하거나 독립 실행할 수 있다.
  --tdd 플래그로 TDD 모드(테스트 먼저 작성) 전환 가능.
argument-hint: '[기능명 | session-id | "설명"] [--tdd] [--pipeline] [--no-git-check]'
skills:
  - crb-detect
  - crb-forge
  - crb-output
  - crb-team
---

# forge

1구현 + 2리뷰 에이전트 구조로 코드를 구현한다. Implementer만 Write 권한을 가지며, Reviewer는 Read-only다.

## 플래그 파싱

- `--tdd`: TDD 모드. Tester가 테스트 먼저 작성 → Implementer가 통과하도록 구현
- `--pipeline`: smelt 내부 호출용. 완료 후 선택지 메시지를 출력하지 않는다
- `--no-git-check`: git 안전 검사를 건너뛴다 (스크립트/smelt 내부 호출용)
- `--solo`: Solo 모드 즉시 실행
- `--team`: Team 모드 즉시 실행

## 모드 결정

`crb-team` 스킬의 규칙에 따라 Solo/Team 모드를 결정한다.

- **Solo 모드**: 아래 [Solo 모드 워크플로우](#solo-모드-워크플로우) 진행
- **Team 모드**: 아래 [Team 모드 워크플로우](#team-모드-워크플로우) 진행

## 입력 파싱

| 인수 | 동작 |
|------|------|
| (없음) | 가장 최근 mold 출력 자동 참조. 없으면 안내 메시지 출력 |
| `crb-YYYYMMDD-HHMMSS` (세션 ID) | 해당 mold 세션 결과 기반 구현 |
| 텍스트/기능명 | 독립 실행 (mold 없이 mini-mold 단계 진행) |

인수 없고 최근 mold 출력도 없을 때:
```
구현할 기능을 입력하세요.
예: /crb:forge "결제 서비스 구현"
    /crb:forge crb-20260416-143022  (mold 세션 ID)
    /crb:forge  (가장 최근 mold 자동 참조)
```

## 세션 초기화

`crb-output` 스킬 규칙에 따라 세션을 초기화한다:
- 세션 ID: `crb-{YYYYMMDD}-{HHMMSS}`
- `user_input.raw`에 원본 입력 기록
- `user_input.flags`에 감지된 플래그 목록 기록
- `mode`: 모드 결정 단계에서 확정된 값 (`"solo"` | `"team"`)

---

## Solo 모드 워크플로우

### ① git 안전 검사

`--no-git-check`가 없을 때 실행한다:

```bash
git rev-parse --is-inside-work-tree 2>/dev/null
```

- git 저장소 아님 → 경고 없이 진행
- git 저장소임 → 미커밋 변경사항 확인:
  ```bash
  git status --porcelain
  ```
  - 변경사항 없음 → 진행
  - 변경사항 있음 → `AskUserQuestion`으로 1회 묻는다:
    ```
    ⚠️ 미커밋 변경사항이 있습니다. forge는 파일을 직접 수정합니다.

    > 현재 브랜치에서 계속
    > 새 브랜치 생성 후 진행 (Recommended)
    > 취소
    ```
  - 새 브랜치 선택 시: 제안 브랜치명 `crb/forge-{기능명}-{YYYYMMDD}` (직접 입력도 가능)
    ```bash
    git checkout -b <브랜치명>
    ```

### ② 프로젝트 컨텍스트 감지

`crb-detect` 스킬 규칙에 따라 언어/프레임워크를 감지하고 컨텍스트에 기록한다.

### ③ mini-mold (mold 참조 없을 때)

mold 세션 참조가 없으면 구현 전 간략한 설계 확인을 한다:

```
─── mini-mold ────────────────────────────
기능: <기능명>
언어/프레임워크: <감지 결과>

구현 방향:
  - 컴포넌트 구조: ...
  - 주요 인터페이스: ...
  - 예상 파일: ...
─────────────────────────────────────────
이 방향으로 구현을 시작할까요?
계속하려면 Enter, 수정이 필요하면 피드백을 입력하세요:
```

`--pipeline` 또는 `--auto`가 있으면 mini-mold 확인 없이 자동 진행한다.

### ④ 에이전트 구성 결정

`crb-forge` 스킬 규칙에 따라 구성을 결정하고 한 줄로 알린다:
```
forge 구성: Claude(구현) / Codex(리뷰1·아키텍처) / Gemini(리뷰2·버그)
```

`--tdd`이면:
```
forge 구성 (TDD): Codex(테스트) / Claude(구현) / Gemini(Guard)
```

### ⑤ 구현 및 병렬 리뷰

`crb-forge` 스킬 규칙에 따라 실행한다:

**일반 모드:**
1. Implementer(Claude)가 코드 구현 (Write/Edit 권한)
2. 구현 완료 후 Reviewer 1, 2가 **병렬로** 리뷰 실행 — 순차 실행 금지
   - Reviewer 1: 아키텍처·구조 관점
   - Reviewer 2: 버그·엣지케이스·보안 관점

**--tdd 모드:**
1. Tester가 테스트 파일 먼저 작성 (Write 권한: 테스트 파일 한정)
2. Implementer(Claude)가 테스트를 통과하도록 구현
3. Guard가 테스트 + 구현 모두 리뷰

### ⑥ 2/3 합의 판정 및 반영

`crb-forge` 스킬 규칙에 따라 피드백 항목별 2/3 합의를 판정한다.

반영 확정 항목을 Implementer가 코드에 적용한다.

### ⑦ 결과물 저장

`crb-output` 스킬 규칙에 따라 저장한다:

1. `crb-forge` 스킬 형식으로 `.crb/outputs/{session_id}.md` 생성
2. `.crb/runs/run-log.jsonl`에 한 줄 append (`status: completed`, `mode`는 세션 초기화 시 확정된 값)
3. 저장 경로 출력:
   ```
   결과 저장됨: .crb/outputs/{session_id}.md
   ```

### ⑧ 다음 단계 안내

`--pipeline` 플래그가 없을 때만 출력한다:

```
구현이 완료되었습니다. 다음 단계를 선택하세요.

> assay로 정밀 리뷰 실행
> security로 보안 점검 실행
> 완료 (추가 리뷰 불필요)
```

---

## Team 모드 워크플로우

Agent Teams 기반 실시간 토론 구현.

### Teammate 구성 (일반 모드)

| Teammate | 모델 | 역할 | 쓰기 권한 |
|----------|------|------|----------|
| Implementer | Opus | 코드 구현 | Write/Edit (전용) |
| Architect | Sonnet | 아키텍처 관점 실시간 피드백 | Read-only |
| Guard | Sonnet | 버그·보안 관점 실시간 피드백 | Read-only |

### Teammate 구성 (--tdd 모드, 역할 재정의)

| Teammate | 모델 | 역할 | 쓰기 권한 |
|----------|------|------|----------|
| Tester | Sonnet | 테스트 작성 전담 | 테스트 파일 한정 |
| Implementer | Opus | 구현 전담 | 구현 코드 전용 |
| Guard | Sonnet | 테스트 + 구현 동시 리뷰 | Read-only |

### ① git 안전 검사 및 프로젝트 컨텍스트 감지

Solo 모드와 동일하게 진행한다.

### ② 실시간 토론 구현 (일반 모드)

Implementer가 코드를 작성하는 동안 Architect와 Guard가 실시간으로 읽고 피드백한다:

```
Architect→Implementer: "이 구조보다 이렇게 하면 확장성 좋아져"
Guard→Implementer: "여기 NPE 가능성 있어, null 체크 필요"
Implementer→Architect: "그러면 인터페이스 분리할게"
```

Implementer가 피드백을 반영하며 토론하면서 구현을 완성한다.

### ② TDD 흐름 (--tdd 모드)

```
Tester→Implementer: "이 테스트 통과시켜봐"
Implementer→Tester: "이 테스트 케이스 의도가 뭐야?"
Guard→Tester,Implementer: "둘 다 경계 조건 빠졌어"
```

### ③ 결과물 저장

Solo 모드와 동일한 형식, `"mode":"team"` 기록.
`--pipeline` 동작도 Solo와 동일하게 적용한다.

---

## Gotchas

- Implementer만 Write 권한 — Reviewer는 어떤 상황에서도 파일 수정 금지
- --tdd 모드의 Tester Write 범위는 테스트 파일 한정 — 구현 파일 수정 금지
- Reviewer 2개는 반드시 병렬로 실행 — 순차 실행 금지
- mini-mold는 30초 이내의 간략 확인 — cast/mold 수준의 상세 분석 아님
- Codex/Gemini 오류 시 Claude로 조용히 대체하고 리포트에 실제 사용 모델 기록
- --pipeline 플래그가 있으면 완료 후 선택지를 출력하지 않는다 (smelt가 직접 다음 단계 제어)
- run-log.jsonl 기록은 완료 시 한 번만 append — 중간에 쓰지 않음
