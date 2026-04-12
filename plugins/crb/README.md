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
| [`/crb:assay`](#crbassay) | 순도 측정 | 코드를 3개 관점으로 정밀 리뷰 |
| [`/crb:challenge`](#crbchallenge) | 담금질 | 기획·결과물에 적대적 리뷰 standalone 실행 |

### 상황별 커맨드

| 커맨드 | 역할 |
|--------|------|
| [`/crb:security`](#crbsecurity) | 보안 취약점 점검 (OWASP · 인증 · 데이터 노출) |
| [`/crb:debug`](#crbdebug) | 에러 원인 분석 + 수정 방향 도출 |

### 유틸리티

| 커맨드 | 역할 |
|--------|------|
| `/crb:setup` | 환경 세팅 (RTK · Agent Teams · Codex · Gemini) |
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

**출력:** 🔴 Critical · 🟡 Warning · 🔵 Info 심각도 분류 + 즉시 수정 권고

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
| Agent Teams (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`) | 필수 | 병렬 에이전트 실행 |
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
│   ├── assay.md             # /crb:assay
│   ├── challenge.md         # /crb:challenge
│   ├── security.md          # /crb:security
│   ├── debug.md             # /crb:debug
│   ├── setup.md             # /crb:setup
│   ├── status.md            # /crb:status
│   └── result.md            # /crb:result
└── skills/                  # 내부 스킬 (cast가 사용)
    ├── crb-explore/         # Explore 단계 병렬 실행 규칙
    ├── crb-frame/           # Frame 단계 합의 수렴 규칙
    └── crb-output/          # 출력 파일 저장 규칙
```

---

## 변경 이력

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
