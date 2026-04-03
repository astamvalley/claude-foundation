# 완성 예시: git-commit 스킬

아래는 잘 만들어진 스킬의 실제 예시다. 자신의 스킬 작성 시 품질 기준으로 참고한다.

```markdown
---
name: git-commit
description: >
  현재 변경사항을 분석해 Conventional Commits 형식으로 커밋 메시지를 작성하고
  커밋한다. "커밋해줘", "변경사항 저장해줘", "커밋 메시지 만들어줘" 등에 반응한다.
disable-model-invocation: true
---

# Git Commit

현재 staged 변경사항을 분석해 커밋 메시지를 작성하고 커밋한다.

## 작업 순서

- [ ] 1단계: `git diff --staged` 로 변경사항 파악
- [ ] 2단계: 변경 유형 분류 (feat/fix/refactor/docs/chore)
- [ ] 3단계: 커밋 메시지 초안 작성
- [ ] 4단계: 사용자 확인 후 `git commit -m` 실행

## 커밋 메시지 형식

```
<type>(<scope>): <subject>

[optional body]
```

예시:
- `feat(auth): 소셜 로그인 추가`
- `fix(api): 토큰 만료 시 자동 갱신 처리`
- `refactor(db): 쿼리 최적화`

## Gotchas

- staged 파일이 없으면 먼저 `git add` 안내 후 중단
- 여러 관심사가 섞인 경우 분리 커밋 제안
- 마이그레이션 파일 변경은 항상 body에 영향 범위 명시
```

## 이 예시에서 배울 점

- **description**: 명령형 + 키워드 미언급 케이스 포함 + `disable-model-invocation` 설정
- **작업 순서**: 체크리스트로 단계 명확화
- **출력 형식**: 커밋 메시지 템플릿 인라인 제공
- **Gotchas**: 일반 지식(git commit 문법) 없이 이 컨텍스트에서만 필요한 것만
- **길이**: 짧고 밀도 높음 — 에이전트가 이미 아는 내용 없음
