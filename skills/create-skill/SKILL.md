---
name: create-skill
description: >
  agentskills.io 스펙을 따르는 새 Agent Skill(SKILL.md + 지원 파일)을 제작한다.
  사용자가 스킬을 만들거나, 워크플로우를 스킬로 패키징하거나, 슬래시 커맨드를
  만들고 싶다고 할 때 사용한다. "스킬 만들어줘", "이 작업을 스킬로 만들고 싶어",
  "반복 작업 자동화하고 싶어" 같은 표현에도 반응한다.
metadata:
  version: "1.0.0"
---

# 스킬 제작 가이드

사용자가 agentskills.io 스펙을 준수하는 고품질 스킬을 만들도록 안내한다.
만들어진 스킬은 Claude Code, Cursor, VS Code Copilot, Gemini CLI 등 30개 이상의 도구에서 바로 사용 가능하다.

## 1단계: 요구사항 파악

작성 전에 반드시 스킬의 목적을 이해한다. 다음을 물어보거나 추론한다.

**어떤 작업을 처리하는 스킬인가?**
한 가지 일관된 작업 단위여야 한다. 너무 좁으면 (단순 작업 하나) 스킬 효과가 없고,
너무 넓으면 (모든 DB 관련 작업) 정확한 트리거가 어렵다.

**어떤 전문 지식을 담을 것인가?** 다음을 구체적으로 캐묻는다.
- 에이전트가 모를 프로젝트별 관례나 제약사항
- 겉보기엔 맞지만 이 프로젝트에서는 틀린 것들 (gotchas)
- 사용해야 할(또는 피해야 할) 특정 도구/라이브러리/API
- 필요한 입출력 형식이나 템플릿

**어떻게 호출되는가?**
- 사용자가 `/스킬명`으로 직접 실행 → `disable-model-invocation: true`
- 관련 작업 시 Claude가 자동 활성화 → 기본값 (플래그 없음)
- Claude가 항상 참고하는 배경 지식 → `user-invocable: false`

사용자가 막연하게 요청하면 구체적인 전문 지식을 파악하는 질문을 하나만 한다.

## 2단계: 구조 설계

**[references/spec.md](references/spec.md)를 지금 읽는다** — name 규칙, frontmatter 필드, 토큰 예산 확인.

```
skill-name/
├── SKILL.md              # 항상 필수
├── scripts/              # 반복 실행할 명령어가 있을 때
├── references/           # SKILL.md가 500줄을 초과할 때
└── assets/               # 에이전트가 채울 템플릿
```

## 3단계: SKILL.md 작성

[assets/skill-template.md](assets/skill-template.md)를 시작점으로 사용한다.
완성된 스킬 예시는 [assets/example-skill.md](assets/example-skill.md) 참고.

### 에이전트가 모르는 것만 쓴다

```markdown
# 나쁨 — 에이전트가 이미 아는 내용
pdfplumber는 PDF에서 텍스트를 추출하는 라이브러리입니다...

# 좋음 — 모를 내용만
텍스트 추출은 pdfplumber 사용. 스캔 문서는 pdf2image + pytesseract로 대체.
```

### Gotchas 섹션은 반드시 포함한다

스킬에서 가장 가치 있는 내용이다. 에이전트가 말해주지 않으면 틀리는 것들:

```markdown
## Gotchas
- `users` 테이블은 소프트 딜리트 — 반드시 `WHERE deleted_at IS NULL` 포함
- user_id(DB) = uid(인증) = accountId(결제) — 같은 값, 다른 이름
```

실제 작업 중 에이전트를 교정할 때마다 추가한다.

### 옵션 나열 말고 기본값을 제시한다

```markdown
# 나쁨
pypdf, pdfplumber, PyMuPDF 중 선택...

# 좋음
pdfplumber 사용. 스캔 문서(OCR 필요)는 pdf2image + pytesseract.
```

### 출력 형식은 템플릿으로, 멀티스텝은 체크리스트로

### 참고 파일은 언제 읽을지 조건을 명시한다

```markdown
# 나쁨 — 막연한 참조
자세한 내용은 references/ 참고.

# 좋음 — 조건부 로딩
API가 200이 아닌 응답을 반환하면 [references/api-errors.md](references/api-errors.md) 읽기.
```

패턴 상세 예시(체크리스트, Plan-Validate-Execute 등)는
[references/patterns.md](references/patterns.md) 참고.

## 4단계: description 최적화

description은 에이전트가 시작 시 읽는 유일한 정보 — 이것만으로 스킬 활성화 여부를 결정한다.
세부 가이드는 [references/description-guide.md](references/description-guide.md) 참고.

체크리스트:
- [ ] 명령형 어조: "~할 때 이 스킬을 사용한다"
- [ ] 구현 방법이 아닌 사용자 의도 중심
- [ ] 키워드 미언급 케이스: "~라고 명시하지 않더라도"
- [ ] 1024자 이하

## 5단계: 파일 생성

| 범위 | 위치 |
|------|------|
| 전역 (모든 프로젝트) | `~/.claude/skills/<name>/` |
| 프로젝트 한정 | 프로젝트 루트 `.claude/skills/<name>/` |
| 플러그인으로 배포 | 플러그인 디렉토리 내 `skills/<name>/` |

```bash
mkdir -p ~/.claude/skills/<skill-name>/references
```

## 6단계: 검증

- [ ] 디렉토리명 = frontmatter `name` 필드 (가장 흔한 실수)
- [ ] `description` 1024자 이하
- [ ] `SKILL.md` 본문 500줄 이하
- [ ] 파일 참조는 스킬 루트 기준 상대 경로
- [ ] 참고 파일 참조 시 언제 읽을지 조건 명시
- [ ] should-trigger 3개, should-not-trigger 2개 프롬프트로 description 정신 테스트

## Gotchas

- `name` 필드와 디렉토리명 불일치가 가장 흔한 실수 — 반드시 일치해야 함
- description을 한국어로 쓰면 1024자 제한에 쉽게 걸림 — 작성 후 반드시 길이 확인
- references 파일 참조 시 "언제 읽을지" 조건 없이 막연하게 쓰는 경우 많음 — "에러 시 읽기"처럼 조건 명시
- `disable-model-invocation: true`(사용자만)와 `user-invocable: false`(Claude만) 혼동 잦음
- 스킬 본문에 일반 지식 장황하게 설명하는 경우 — 에이전트가 이미 아는 것은 모두 생략
