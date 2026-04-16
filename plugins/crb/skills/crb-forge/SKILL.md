---
name: crb-forge
description: forge 커맨드 내부 스킬. 1구현 + 2리뷰 에이전트 구성, 2/3 합의 판정, --tdd 모드 전환 규칙을 정의한다.
user-invocable: false
---

# crb-forge

forge 커맨드에서만 사용한다.

## 에이전트 구성 결정

모델 감지는 `crb-explore` 스킬의 모델 감지 로직을 재사용한다:

```bash
codex login status 2>/dev/null
[ -f "$HOME/.gemini/oauth_creds.json" ] && echo "gemini:authenticated" || echo "gemini:not-authenticated"
```

### 일반 모드 구성

| 환경 | Implementer | Reviewer 1 (아키텍처) | Reviewer 2 (버그·보안) |
|------|:-----------:|:---------------------:|:----------------------:|
| Codex + Gemini | Claude (Agent) | Codex (CLI) | Gemini (CLI) |
| Codex만 | Claude (Agent) | Codex (CLI) | Claude (Agent) |
| Gemini만 | Claude (Agent) | Gemini (CLI) | Claude (Agent) |
| 둘 다 없음 | Claude (Agent) | Claude (Agent) | Claude (Agent) |

### --tdd 모드 구성 (역할 재정의)

일반 모드와 **완전히 다른 역할**로 전환한다:

| 역할 | 담당 | 쓰기 권한 |
|------|------|-----------|
| Tester | Codex > Gemini > Claude | 테스트 파일 한정 |
| Implementer | Claude (Agent) | 구현 코드 전용 |
| Guard | Gemini > Codex > Claude | Read-only |

TDD 흐름:
1. Tester가 테스트 파일 먼저 작성 (실패 상태의 Red 단계)
2. Implementer가 테스트를 통과하도록 구현 (Green 단계)
3. Guard가 테스트 + 구현 모두 리뷰 (Refactor 단계)
4. 피드백 → 2/3 합의 판정 → 최종 반영

## 쓰기 권한 원칙

- **Implementer만** 구현 코드에 Write 권한 보유
- **Reviewer는 Read-only** — 절대 파일을 수정하지 않는다
- **예외 (--tdd)**: Tester도 테스트 파일(`.test.*`, `.spec.*`, `tests/` 디렉토리)에 한해 Write 권한 보유

## 2/3 합의 판정

리뷰 피드백 항목별로 아래 기준으로 반영 여부를 결정한다. Implementer가 3번째 투표자다.

| 상황 | 판정 |
|------|------|
| Reviewer 1 동의 + Reviewer 2 동의 | **반영** (만장일치) |
| Reviewer 1 동의 + Implementer 동의 | **반영** (2/3) |
| Reviewer 2 동의 + Implementer 동의 | **반영** (2/3) |
| Reviewer 1만 동의 | **기각** (1/3) |
| Reviewer 2만 동의 | **기각** (1/3) |

**기각 시**: 이유를 리포트에 기록한다 (범위 초과, 현재 설계와 충돌, 현재 규모에서 과도 등).

## 리뷰어 실행 방법

### Reviewer가 Codex일 때:
```bash
# 플러그인 우선
CODEX_COMPANION=$(find ~/.claude/plugins -name "codex-companion.mjs" 2>/dev/null | head -1)
if [ -n "$CODEX_COMPANION" ]; then
  node "$CODEX_COMPANION" task "IMPORTANT: Non-interactive. Read-only 리뷰어로 동작. 파일 수정 금지.

[리뷰 대상 코드]
...

리뷰 관점: <아키텍처 구조 / 버그·엣지케이스·보안>
피드백 형식: 항목별 제목 + 근거 한 줄"
fi

# 플러그인 없을 때
codex exec --full-auto "IMPORTANT: Non-interactive subagent. Read-only reviewer. Do not modify files. <리뷰 프롬프트>"
```

### Reviewer가 Gemini일 때:
```bash
printf '%s' "Read-only 리뷰어로 동작. 파일 수정 금지.

[리뷰 대상 코드]
...

리뷰 관점: <아키텍처 구조 / 버그·엣지케이스·보안>
피드백 형식: 항목별 제목 + 근거 한 줄" | gemini -p "" -o text --approval-mode yolo
```

Codex/Gemini 실행 오류 시 Claude Agent로 조용히 대체하고 계속 진행한다.

## 리뷰 리포트 형식

forge 완료 시 `.crb/outputs/{session_id}.md`에 저장한다:

```markdown
# forge: <기능명>

세션 ID: <session_id>
커맨드: forge
모드: solo
TDD: false | true
생성일: <날짜>

## 실행 맥락

- **원본 입력**: "<인수 전체>"
- **mold 참조**: <session_id> | 없음 (mini-mold 실행)
- **구성**: Claude(구현) / Codex(리뷰1) / Gemini(리뷰2)
- **언어/프레임워크**: TypeScript / Next.js (crb-detect)

## 생성된 파일

- `src/payment/service.ts` (신규)
- `src/payment/types.ts` (신규)
- `src/payment/__tests__/service.test.ts` (신규, --tdd)

## 리뷰 피드백 및 반영

### Reviewer 1 (아키텍처)
- [반영] 서비스 레이어 분리 제안 → 적용
- [기각] 이벤트 소싱 패턴 → 현재 규모에서 과도

### Reviewer 2 (버그·보안)
- [반영] 입력 검증 누락 → null 체크 추가
- [반영] 동시성 이슈 → 락 처리 추가

## 합의 판정

반영: 3건 / 기각: 1건 (2/3 합의 기준)
```

## Gotchas

- Reviewer는 어떤 상황에서도 파일을 Write하지 않는다 — Read-only 원칙은 절대적
- --tdd 모드에서 Tester의 Write 범위는 테스트 파일에 한정 — 구현 파일 수정 금지
- Codex/Gemini 오류 시 Claude로 대체하되 리포트에 실제 사용 모델을 기록한다
- 2/3 판정은 항목별로 적용 — 전체 리뷰를 일괄 반영/기각하지 않는다
