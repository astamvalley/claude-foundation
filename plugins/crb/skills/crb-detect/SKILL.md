---
name: crb-detect
description: 프로젝트 루트에서 언어·프레임워크를 자동 감지하고 .crb/project-context.md에 캐시한다. forge와 mold에서 재사용한다.
user-invocable: false
---

# crb-detect

forge, mold 커맨드가 구현/설계 시 프로젝트 환경을 자동으로 파악하기 위해 사용한다.

## 감지 순서

아래 파일을 순서대로 탐색해 언어와 프레임워크를 결정한다:

```bash
[ -f package.json ]      && cat package.json
[ -f pyproject.toml ]    && cat pyproject.toml
[ -f setup.py ]          && cat setup.py
[ -f go.mod ]            && cat go.mod
[ -f Cargo.toml ]        && cat Cargo.toml
[ -f build.gradle ]      && cat build.gradle
[ -f pom.xml ]           && head -30 pom.xml
```

여러 파일이 동시에 존재할 수 있다 (예: Python + Rust FFI 프로젝트). 감지된 것을 모두 기록한다.

## 감지 결과 매핑

| 파일 | 언어 | 프레임워크 판단 기준 |
|------|------|---------------------|
| `package.json` | Node.js / TypeScript | `dependencies`에 `react`, `next`, `express`, `fastify`, `vue`, `svelte` 등 포함 여부 |
| `pyproject.toml` / `setup.py` | Python | `fastapi`, `django`, `flask`, `starlette` 포함 여부 |
| `go.mod` | Go | 모듈 경로로 프레임워크 추정 (`gin`, `echo`, `fiber`) |
| `Cargo.toml` | Rust | `actix-web`, `axum`, `tokio` 포함 여부 |
| `build.gradle` / `pom.xml` | Java / Kotlin | `spring`, `quarkus` 포함 여부 |

TypeScript 여부: `package.json`에 `typescript` 의존성 또는 `tsconfig.json` 존재 여부로 판단.

## 캐시 처리

`.crb/project-context.md`가 이미 존재하면:
- 파일의 `<!-- crb-detect-cache -->` 섹션을 확인
- 존재하면 감지를 재실행하지 않고 캐시를 사용한다
- 존재하지 않으면 감지 후 섹션을 추가한다

캐시 무효화: `--no-cache` 플래그가 있으면 항상 재감지한다.

## 출력 형식

감지 결과를 컨텍스트에 보관하고, `.crb/project-context.md`의 `<!-- crb-detect-cache -->` 섹션에 기록한다:

```
<!-- crb-detect-cache -->
언어: TypeScript (Node.js)
프레임워크: Next.js 14, React 18
런타임: Node.js
패키지 매니저: npm | yarn | pnpm (lock 파일로 판단)
스타일 컨벤션:
  - TypeScript strict 모드: true (tsconfig.json 확인)
  - 테스트 프레임워크: jest | vitest | none
<!-- /crb-detect-cache -->
```

## 컨벤션 적용 규칙

감지된 언어별로 구현·설계 스타일에 반영한다:

| 언어 | 자동 적용 규칙 |
|------|--------------|
| TypeScript | `interface`/`type` 우선, strict null checks, `unknown` 대신 타입 좁히기 |
| Python | type hint 포함, PEP8 스타일, `Optional[T]` 대신 `T \| None` (Python 3.10+) |
| Go | `errors.Wrap` 패턴, defer/recover 활용, 명시적 에러 반환 |
| Rust | `Result<T, E>` 패턴, `?` 연산자 활용 |
| Java/Kotlin | 빌더 패턴, 의존성 주입 선호 |

## Gotchas

- 감지 실패 시 에러 없이 빈 컨텍스트로 진행 — 감지 불가를 에러로 처리하지 않는다
- 모노레포는 루트 + 하위 디렉토리를 모두 탐색해 주요 언어를 복수로 기록한다
- 감지 결과는 참고용 — 사용자가 `.crb/project-context.md`를 수동 수정하면 그 내용이 우선한다
