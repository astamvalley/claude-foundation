---
name: auto-commit
description: >
  변경된 코드를 분석해 커밋 컨벤션에 맞는 커밋 메시지를 자동으로 생성하고 커밋을 실행한다.
  "/auto-commit", "커밋 만들어줘", "커밋 해줘", "변경사항 커밋", "작업 커밋"이라고 할 때 사용한다.
  "커밋"이라고만 해도 동작한다. 커밋 메시지를 직접 쓰지 않고 자동화하고 싶을 때 사용한다.
  git commit, conventional commit, 커밋 자동화는 이 스킬을 사용한다.
disable-model-invocation: true
---

# auto-commit

커밋 컨벤션을 기반으로 변경 사항을 분석해 커밋 플랜을 생성하고, 사용자 확인 후 커밋을 실행한다.

## 작업 순서

- [ ] 1단계: 환경 스캔 (브랜치, 변경 파일, Task 목록)
- [ ] 2단계: 위험 파일 감지 및 처리
- [ ] 3단계: 커밋 플랜 생성 및 미리보기
- [ ] 4단계: 진행 방식 확인
- [ ] 5단계: 커밋별 개별 확인 후 실행

---

## 1단계: 환경 스캔

아래 세 가지를 병렬로 수집한다.

**브랜치명 확인:**
```bash
git branch --show-current
```

**변경 파일 전체 확인:**
```bash
git status --short
git diff HEAD
```

**현재 Task 목록 확인:**
`TaskList` 도구로 활성 Task를 조회한다. Task가 있으면 커밋 플랜의 Why 작성에 활용한다.

---

## 2단계: 위험 파일 감지

아래 패턴에 해당하는 파일이 변경 목록에 있으면 커밋 플랜 생성 전에 먼저 처리한다.

**위험 파일 패턴:**
- `.env`, `.env.*`, `*.env`
- `*secret*`, `*credential*`, `*password*`, `*token*`
- `*.pem`, `*.key`, `*.p12`, `*.pfx`
- `config/secrets.*`, `*private*`

**처리 방식 — `AskUserQuestion`으로 파일별 확인:**
선택지 텍스트는 아래를 그대로 사용한다.

```
⚠️  커밋하면 안 될 것 같은 파일이 감지됐습니다:
  · .env
  · config/secrets.json

어떻게 할까요?
```
선택지:
1. `.gitignore에 추가 후 제외`
2. `이번 커밋에서만 제외`
3. `그냥 포함 (직접 판단)`

---

## 3단계: 커밋 플랜 생성

### 커밋 분리 기준

변경 파일을 아래 기준으로 그룹핑한다:

1. **Task 기준** — 활성 Task가 있으면 파일 경로와 diff 내용을 분석해 각 Task에 귀속
2. **변경 성격 기준** — Task가 없으면 변경 성격이 다른 파일끼리 분리
   - 기능 변경 vs 의존성 변경(`package.json`, `*.lock`) vs 설정 변경
3. **애매한 파일** — 공용 유틸(`utils/`, `helpers/`, `common/`)처럼 어느 그룹인지 불명확하면 `AskUserQuestion`으로 사용자에게 귀속 Task/그룹을 물어본다

### 커밋 메시지 형식

```
type: [브랜치명] subject

why 설명 (문제 상황 또는 변경 동기)
what 설명 (`함수명()`으로 특이사항 있는 코드 명시)

Footer: #이슈번호
```

**브랜치명 규칙:**
- `main`, `master`, `develop` 브랜치면 `[브랜치명]` 생략
- 그 외 브랜치는 `[브랜치명]` 포함: `feat: [feature/TEST-1234] subject`

**type 선택 기준:**

| type | 사용 조건 |
|------|----------|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 수정만 |
| `style` | 코드 포맷, 세미콜론 등 동작 변경 없음 |
| `refactor` | 동작 변경 없이 코드 구조 개선 |
| `test` | 테스트 코드 추가/수정 |
| `chore` | 빌드, 의존성, 설정 파일 변경 |

**subject 규칙:**
- 영문 소문자 동사 원형으로 시작
- 50자 이내, 마침표 없음

**body 작성 기준:**
- **Why**: 변경 전 문제 상황 또는 변경이 필요한 이유를 1~2문장으로 서술
- **What**: 특이사항 있는 함수/클래스는 백틱으로 명시 (`ClassName.method()` 형태), 어떤 처리를 했는지 한 줄로
- How(구현 세부사항)는 diff로 확인 가능하므로 생략
- 한 줄 72자 이내, 관심사가 다르면 빈 줄로 단락 구분

**footer 작성 기준:**
- Task 또는 브랜치명에 이슈 번호가 있으면 포함
- `Resolves: #번호` (이슈 해결), `Fixes: #번호` (버그 수정), `Related to: #번호` (관련 이슈)
- 이슈 번호가 없으면 footer 생략

### 플랜 출력 형식

```
변경 사항을 분석했습니다. 아래와 같이 커밋을 나눌 수 있습니다.

── 커밋 1/2 ────────────────────────────────────
feat: [feature/TEST-1234] add user login page

JWT 기반 인증이 없어 모든 API가 인증 없이 노출되는
상태였다. 로그인 폼과 인증 미들웨어를 추가해 접근을
제어한다.

`AuthMiddleware.verify()`로 토큰 유효성 검사,
`SessionManager.expire()`로 만료 시 자동 로그아웃 처리.

Resolves: #1234

  📄 src/auth/LoginPage.tsx
  📄 src/auth/AuthMiddleware.ts

── 커밋 2/2 ────────────────────────────────────
chore: [feature/TEST-1234] update dependencies

보안 취약점 패치를 위해 의존성 버전을 업데이트한다.

  📄 package.json
  📄 package-lock.json
────────────────────────────────────────────────
```

---

## 4단계: 진행 방식 확인

`AskUserQuestion` (free_form 포함)으로 진행 방식을 선택받는다.
선택지 텍스트는 아래를 그대로 사용한다.

```
어떻게 진행할까요?
```
선택지:
1. `이대로 진행 (커밋 N개)` — N은 실제 커밋 수로 치환
2. `하나의 커밋으로 합치기`
3. (free_form) `요청사항 직접 입력`

**free_form 입력 처리:**
- "2번 커밋 메시지 수정해줘" → 해당 커밋 메시지만 수정 후 플랜 다시 보여주기
- "커밋 1, 2 합쳐줘" → 해당 커밋 머지 후 플랜 다시 보여주기
- "3번은 빼줘" → 해당 커밋 제외 후 플랜 다시 보여주기
- 요청 반영 후 항상 플랜을 다시 출력하고 4단계 재진행

---

## 5단계: 커밋별 개별 확인 후 실행

각 커밋마다 순서대로:

1. 해당 커밋에 포함된 파일만 `git add`
2. `AskUserQuestion` (free_form 포함)으로 확인
선택지 텍스트는 아래를 그대로 사용한다.

```
── 커밋 1/2 ────────────────────────────────────
feat: [feature/TEST-1234] add user login page
...커밋 메시지 전체 표시...

  📄 src/auth/LoginPage.tsx
  📄 src/auth/AuthMiddleware.ts
────────────────────────────────────────────────

이 커밋을 진행할까요?
```
선택지:
1. `커밋`
2. `건너뛰기`
3. (free_form) `메시지 수정 내용 입력`

**free_form 입력 처리:**
- 수정 내용을 반영해 커밋 메시지를 업데이트하고 확인 화면 다시 보여주기

3. `git commit -m "..."` 실행 (HEREDOC 방식으로 멀티라인 메시지 전달)
4. 다음 커밋으로 이동

모든 커밋 완료 후:
```
✓ 커밋 1/2 완료: feat: [feature/TEST-1234] add user login page
✓ 커밋 2/2 완료: chore: [feature/TEST-1234] update dependencies
```

---

## Gotchas

- **브랜치 판단** — `main`, `master`, `develop` 외에도 `HEAD detached` 상태면 브랜치명 생략
- **한국어 72자 줄바꿈** — 한글은 시각적으로 영문의 2배 너비. 한글 body 작성 시 실질적으로 36자 기준으로 줄바꿈
- **staged 파일 선처리** — 이미 staged된 파일이 있으면 스캔 단계에서 감지해 사용자에게 알린 후 플랜에 포함
- **병렬 작업 커밋** — Task가 여러 개인데 같은 파일을 건드린 경우, 가장 최근 Task에 귀속시키고 body에 두 Task 모두 언급
- **커밋 메시지 heredoc** — 멀티라인 커밋 메시지는 반드시 heredoc으로 전달해야 줄바꿈이 보존됨
  ```bash
  git commit -m "$(cat <<'EOF'
  feat: [feature/TEST-1234] add user login page

  본문 내용...

  Resolves: #1234
  EOF
  )"
  ```
- **건너뛰기 후 staged 파일** — 커밋을 건너뛰면 해당 파일은 staged 상태로 남음. 모든 커밋 완료 후 staged 파일이 남아있으면 사용자에게 알림
