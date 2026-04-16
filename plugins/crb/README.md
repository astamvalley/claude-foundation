# crb (crucible)

> 도가니(crucible)에서 금속을 녹여 정제하듯, 아이디어와 코드를 다각도로 분석해 더 단단하게 만드는 Claude Code 플러그인.

claude-octopus의 Double Diamond 방법론에서 영감을 받았으나, bash 스크립트 없이 Claude Code Agent 도구로 구현해 macOS 환경의 stdin 문제를 근본적으로 해소했다.

## 설치

```bash
# 1. 레포 클론 (처음 한 번)
git clone https://github.com/astamvalley/claude-foundation

# 2. 마켓플레이스 등록 (처음 한 번)
# Claude Code에서:
/plugin marketplace add /절대경로/claude-foundation

# 3. 플러그인 설치
/plugin install crb
/reload-plugins

# 4. 환경 세팅
/crb:setup
```

업데이트:
```bash
git pull
/reload-plugins
```

## 커맨드

### 핵심 워크플로우

| 커맨드 | 메타포 | 역할 |
|--------|--------|------|
| [`/crb:cast`](#crbcast) | 주조 | 기획·방향·아이디어를 4단계로 정제 |
| [`/crb:mold`](#crbmold) | 주형 | 구현 전 기술 구조 설계 |
| [`/crb:forge`](#crbforge) | 단조 | 1구현 + 2리뷰 에이전트 구조로 코드 구현 |
| [`/crb:smelt`](#crbsmelt) | 제련 | mold → forge → assay 자동 파이프라인 |
| [`/crb:assay`](#crbassay) | 순도 측정 | 코드를 3개 관점으로 정밀 리뷰 |
| [`/crb:challenge`](#crbchallenge) | 담금질 | 기획·결과물에 적대적 리뷰 standalone 실행 |

### 상황별 커맨드

| 커맨드 | 역할 |
|--------|------|
| [`/crb:security`](#crbsecurity) | 보안 취약점 점검 (OWASP · 인증 · 데이터 노출) |
| [`/crb:debug`](#crbdebug) | 에러 원인 분석 + 수정 방향 도출 |
| [`/crb:auto`](#crbauto) | 자연어로 적합한 커맨드 자동 탐지 후 실행 |

### 유틸리티

| 커맨드 | 역할 |
|--------|------|
| `/crb:help [커맨드명]` | 전체 커맨드 요약 또는 커맨드별 상세 도움말 |
| `/crb:setup` | 환경 세팅 (RTK · Agent Teams · Codex · Gemini) |
| `/crb:stats` | 커맨드별 사용 횟수·모드 분포 통계 |
| `/crb:status` | 실행 이력 조회 |
| `/crb:result [세션ID]` | 결과 파일 열람 |

---

## /crb:cast

기획·방향·아이디어를 4단계 워크플로우로 정제한다. cast의 대상은 **아직 확정되지 않은 기획과 방향**이다. 단순 질문이나 코딩 작업에는 사용하지 않는다.

```
/crb:cast <주제>
/crb:cast --auto <주제>          # 사람 확인 없이 자동 실행
/crb:cast --depth quick <주제>   # Explore + Frame만 (빠른 초안)
/crb:cast --depth deep <주제>    # 각 단계 심층 반복
/crb:cast --lens A,B,C <주제>    # 렌즈 직접 지정
/crb:cast --background <주제>    # 백그라운드 실행
```

**워크플로우:**
```
Explore  →  Frame  →  Design  →  Challenge
(병렬분석)   (합의수렴)  (방향제시)  (적대적리뷰)
```

**예시:**
```
/crb:cast "CARRIER 게임의 공포 연출 방향"
/crb:cast --auto "crb v2.0 기능 우선순위"
/crb:cast --depth quick "모노레포 vs 멀티레포"
```

---

## /crb:mold

코드를 짜기 전에 구조의 틀을 잡는다. 아키텍처·데이터 모델·엣지케이스 3개 렌즈로 고정 분석해 실행 가능한 설계 문서를 출력한다.

```
/crb:mold <기능명 또는 설명>
```

**렌즈 (고정):**
- Agent A: 아키텍처 (레이어 분리, 의존성, 확장성)
- Agent B: 데이터 모델 (엔티티, 관계, 상태 흐름)
- Agent C: 엣지케이스 (실패 시나리오, 경계 조건, 롤백)

**출력:** 권장 구조 · 데이터 모델 · 결정 필요 항목 · 다음 단계

**예시:**
```
/crb:mold 유저 인증 시스템
/crb:mold "결제 플로우 — Stripe 연동, 환불 처리 포함"
```

**cast와의 차이:**
| | cast | mold |
|--|------|------|
| 대상 | 기획·방향 | 구현할 기능 |
| 수준 | 개념적 | 코드 레벨 |
| 단계 | Explore→Frame→Design→Challenge | Explore→Synthesize |

---

## /crb:forge

1구현 + 2리뷰 에이전트 구조로 코드를 구현한다. Implementer(Claude)가 코드를 작성하고 Reviewer 2개가 병렬로 리뷰한 뒤 2/3 합의 기준으로 피드백을 반영한다.

```
/crb:forge                          # 가장 최근 mold 출력 자동 참조
/crb:forge crb-20260416-143022      # 특정 mold 세션 기반
/crb:forge "결제 서비스 구현"        # mold 없이 독립 실행
/crb:forge --tdd "인증 모듈"        # TDD 모드 (테스트 먼저 작성)
```

**에이전트 구성 (일반 모드):**
| 역할 | 담당 | 관점 |
|------|------|------|
| Implementer | Claude | 코드 구현 (Write 전용) |
| Reviewer 1 | Codex 우선 → Claude | 아키텍처·구조 |
| Reviewer 2 | Gemini 우선 → Claude | 버그·엣지케이스·보안 |

**2/3 합의 판정**: 피드백 항목별로 Implementer + 2 Reviewer 중 2/3 이상 동의 시 반영.

---

## /crb:smelt

mold(설계) → forge(구현) → assay(리뷰)를 자동으로 체이닝한다.

```
/crb:smelt "파일 업로드 컴포넌트 — 드래그앤드롭, 프리뷰, 진행률"
/crb:smelt --holdout "환불 처리" "결제 API — Stripe 연동, 환불 처리"
/crb:smelt --no-rollback "간단한 유틸 함수"
```

**워크플로우:**
```
① git 안전 검사  →  ② mold  →  ③ forge  →  ④ assay  →  ⑤ 결과 저장
```

**자율 재시도**: assay에서 Critical/High 이슈 발견 시 만족도 점수 기반으로 forge 재시도(최대 2회). 점수가 하락하면 rollback 후 사용자에게 선택지 제시.

**--holdout**: 특정 요구사항을 숨긴 채 구현 후 blind 테스트로 만족도 점수에 반영.

---

## /crb:assay

코드를 3개 독립 리뷰어가 병렬로 검토해 순도를 측정한다. 단일 모델 코드리뷰와 달리 아키텍처·로직·보안 관점이 동시에 작동한다.

```
/crb:assay <파일경로>      # 특정 파일 리뷰
/crb:assay --staged        # git diff --cached 리뷰
/crb:assay --diff          # git diff 리뷰
/crb:assay "코드 텍스트"   # 직접 입력
/crb:assay                 # staged → diff 자동 감지
```

**리뷰어:**
| 에이전트 | 모델 | 관점 |
|---------|------|------|
| A | Claude | 아키텍처, API 계약, 확장성 |
| B | Codex 우선 → Claude | 로직 오류, 엣지케이스, 타입 안전성 |
| C | Claude (보안 페르소나) | 입력 검증, 인증, 데이터 노출 |

**출력:** 🔴 Critical · 🟡 High · 🟠 Medium · 🔵 Low 심각도 분류 + 즉시 수정 권고

**예시:**
```
/crb:assay src/auth.ts
/crb:assay --staged
```

---

## /crb:challenge

cast 전체를 다시 실행하지 않고 적대적 리뷰만 독립 실행한다.

```
/crb:challenge                          # 최근 cast 결과 대상
/crb:challenge crb-20260412-143022      # 특정 세션 대상
/crb:challenge 기획서.md                # 파일 대상
/crb:challenge "우리 앱의 인증 설계"    # 텍스트 직접 입력
```

---

## /crb:security

assay의 보안 렌즈만 3배로 깊게 파고든다. 인증·결제·개인정보 등 민감한 기능 완성 후 실행한다.

```
/crb:security <파일경로>
/crb:security --staged
/crb:security --diff
/crb:security "기능 설명"   # 코드 없이 설계 단계 점검
```

**렌즈 (고정):**
- Agent A: OWASP Top 10 (Injection, XSS, CSRF 등)
- Agent B: 인증·인가 흐름 (세션, 토큰, 권한 누락)
- Agent C: 데이터 노출 (로깅, 응답 과다 노출, 암호화)

**출력:** 🔴 Critical · 🟡 High · 🟠 Medium · 🔵 Low + 수정 우선순위

---

## /crb:debug

에러 메시지를 붙여넣으면 원인·영향 범위·수정 방향을 빠르게 도출한다.

```
/crb:debug "TypeError: Cannot read properties of undefined"
/crb:debug src/auth.ts
/crb:debug "로그인 후 간헐적으로 500 에러 발생"
```

**3개 관점 병렬 분석:**
- Agent A: 근본 원인, 트리거 조건
- Agent B (Codex 우선): 영향 범위, 데이터 정합성 위험
- Agent C: 즉각 수정 방법, 재발 방지

**출력:** 핵심 원인 한 줄 요약 + 즉시 적용 가능한 수정 코드 + 확인 체크리스트

---

## /crb:auto

자연어로 작업을 설명하면 가장 적합한 crb 커맨드를 자동으로 탐지해 실행한다.

```
/crb:auto "결제 로직에 SQL 인젝션 있을 것 같아"   →  security 실행
/crb:auto "파일 업로드 기능 구조 잡고 싶어"        →  mold 실행
/crb:auto "이 에러 왜 나는지 모르겠어"             →  debug 실행
/crb:auto "로그인 플로우 만들어줘"                 →  forge 실행
```

커맨드 이름을 외울 필요 없이 사용 가능하다. 라우팅이 불확실하면 상위 2개 후보를 제시하고 확인받는다.

---

## 출력 구조

모든 커맨드는 동일한 위치에 결과를 저장한다:

```
프로젝트루트/
└── .crb/
    ├── outputs/
    │   └── crb-YYYYMMDD-HHMMSS.md   # 커맨드별 결과 파일
    └── runs/
        └── run-log.jsonl            # 전체 실행 이력 (append-only)
```

결과 파일은 `/crb:result` 또는 `/crb:result <세션ID>` 로 열람한다.

---

## 환경 요구사항

| 도구 | 필수 여부 | 역할 |
|------|----------|------|
| Claude Code | 필수 | 런타임 |
| Agent Teams (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`) | 선택 | 없으면 Solo 모드로만 동작, 있으면 Team 모드 사용 가능 |
| RTK | 권장 | 병렬 실행 토큰 절약 (60–90%) |
| Codex CLI | 선택 | assay/debug Agent B, challenge 독립 리뷰어 |
| Gemini CLI | 선택 | cast Explore 다른 모델 관점 추가 |

`/crb:setup` 이 모든 환경을 단계별로 점검하고 설정한다.

---

## 파일 구조

```
plugins/crb/
├── .claude-plugin/
│   └── plugin.json          # 플러그인 메타
├── commands/
│   ├── cast.md              # /crb:cast
│   ├── mold.md              # /crb:mold
│   ├── forge.md             # /crb:forge
│   ├── smelt.md             # /crb:smelt
│   ├── assay.md             # /crb:assay
│   ├── challenge.md         # /crb:challenge
│   ├── security.md          # /crb:security
│   ├── debug.md             # /crb:debug
│   ├── auto.md              # /crb:auto
│   ├── stats.md             # /crb:stats
│   ├── setup.md             # /crb:setup
│   ├── status.md            # /crb:status
│   ├── result.md            # /crb:result
│   └── help.md              # /crb:help
└── skills/                  # 내부 스킬
    ├── crb-team/            # Solo/Team 모드 결정 규칙
    ├── crb-explore/         # Explore 단계 병렬 실행 규칙
    ├── crb-frame/           # Frame 단계 합의 수렴 규칙
    ├── crb-forge/           # 1구현+2리뷰 구성 및 2/3 합의 판정 규칙
    ├── crb-detect/          # 언어·프레임워크 자동 감지 및 캐시
    ├── crb-resume/          # 중단된 세션 체크포인트 재개 규칙
    └── crb-output/          # 출력 파일 저장 규칙
```

---

## 변경 이력

### v2.3.0
- `setup`: 커맨드 목록에 "언제 쓰는가" 힌트 추가 (온보딩 명확성)
- `challenge`: "언제 쓰는가" 섹션 추가 (cast 내장 Challenge와 포지셔닝 구분)
- `cast`: `--background` 단독 사용 시 동작 정의 (`--auto` 없으면 포그라운드 전환)
- `smelt`: 자율 재시도 중 만족도 점수·델타 출력 추가

### v2.2.x
- 내부 스킬 추가: crb-team, crb-detect, crb-forge, crb-resume
- `forge` Team 모드 구현 (Implementer/Architect/Guard Teammate 구조)
- `mold` Team 모드 구현 (설계 토론)
- assay/security Round 2 교차검증 추가
- `smelt` 만족도 점수 기반 자율 재시도 + rollback

### v2.0.0
- 신규 커맨드: `/crb:forge` (1구현 + 2리뷰 코드 구현)
- 신규 커맨드: `/crb:smelt` (설계→구현→리뷰 자동 파이프라인)
- 신규 커맨드: `/crb:auto` (자연어 라우팅)
- 신규 커맨드: `/crb:stats` (사용 통계)
- 신규 커맨드: `/crb:setup` (환경 점검)
- Solo/Team 이중 모드 전면 도입

### v1.1.0
- 신규 커맨드: `/crb:mold` (구현 전 구조 설계)
- 신규 커맨드: `/crb:assay` (코드 3개 에이전트 병렬 리뷰)
- 신규 커맨드: `/crb:security` (보안 전용 점검)
- 신규 커맨드: `/crb:debug` (에러 빠른 진단)

### v1.0.0
- 최초 릴리즈
- 내부 스킬 분리: crb-explore, crb-frame, crb-output
- 실행 기록: `.crb/runs/run-log.jsonl` (append-only JSONL)
- 신규 커맨드: `/crb:challenge`, `/crb:status`, `/crb:result`
- `--background`, `--depth`, `--lens`, `--auto` 플래그
