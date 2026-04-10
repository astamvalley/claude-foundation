---
name: crucible
description: >
  다각도 분석과 합의 기반 수렴으로 더 단단한 기획을 만드는 플러그인.
  여러 독립 렌즈로 주제를 탐색하고, 합의를 거쳐 적대적 리뷰로 검증한다.
  claude-octopus의 Double Diamond 방법론을 Claude Code 네이티브로 구현.
metadata:
  version: "1.0.0"
  author: astamvalley
skills:
  - crucible
  - crucible-setup
---

# crucible

claude-octopus의 핵심 가치를 bash 없이 Claude Code 네이티브로 구현한 범용 기획 플러그인.

## 설치

```bash
npx skills add astamvalley/claude-foundation --plugin crucible
```

## 시작하기

처음 사용 전 환경 세팅:

```
/crucible-setup
```

기획 시작:

```
/crucible CARRIER 방05 설계
/crucible --auto 새 앱 아키텍처 결정
```

## 워크플로우

```
① Explore   — 3개 독립 Agent가 동적 렌즈로 병렬 분석
② Frame     — 합의 수렴 + 핵심 긴장점 식별 (기본: 사람 확인)
③ Design    — 구체 방향 제시
④ Challenge — 적대적 리뷰 (Codex 우선, fallback: Claude)
```

결과물 → `crucible-output.md`

## 플래그

| 플래그 | 설명 |
|--------|------|
| `--auto` | Frame 이후 확인 없이 끝까지 자동 실행 |

## 스킬

- [`/crucible`](skills/crucible/SKILL.md) — 메인 워크플로우
- [`/crucible-setup`](skills/crucible-setup/SKILL.md) — 환경 세팅
