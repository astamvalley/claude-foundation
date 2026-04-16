---
description: >
  crb 커맨드 목록과 사용법을 출력한다. 인수 없이 실행하면 전체 요약을,
  커맨드명을 지정하면 해당 커맨드의 상세 도움말을 보여준다.
argument-hint: '[커맨드명]'
allowed-tools: Read
---

# help

crb 커맨드 레퍼런스를 출력한다.

## 입력 파싱

| 인수 | 동작 |
|------|------|
| (없음) | 전체 커맨드 요약 출력 |
| 커맨드명 (예: `cast`, `forge`) | 해당 커맨드 상세 도움말 출력 |

## 전체 요약 출력 (인수 없을 때)

아래 형식으로 출력한다:

```
─────────────────────────────────────────
📖 CRB v2.3.2 — Quick Reference
─────────────────────────────────────────

자연어 진입점:
  /crb:auto "하고 싶은 것을 설명하세요"   커맨드 이름 몰라도 OK

핵심 워크플로우:
  /crb:cast <주제>           기획·방향이 안 잡혔을 때
  /crb:mold <기능명>         설계부터 하고 싶을 때 (구현 전)
  /crb:forge [기능명]        설계 끝났고 바로 구현할 때
  /crb:smelt "기능 명세"     설계→구현→리뷰를 한 번에 자동으로

리뷰·분석:
  /crb:assay [--staged]      코드 품질 점검 (3개 관점 병렬)
  /crb:security [--staged]   보안 취약점 점검 (OWASP·인증·데이터)
  /crb:challenge [주제]      기획·설계의 약점 찾기
  /crb:debug "에러메시지"    에러 원인·영향 범위·수정 방향

유틸리티:
  /crb:stats                 커맨드별 사용 횟수·모드 분포
  /crb:status                실행 이력 조회
  /crb:result [세션ID]       결과 파일 열람
  /crb:setup                 환경 점검 및 설정 (첫 사용 시)

공통 플래그:
  --solo / --team            모드 강제 지정
  --depth quick|standard|deep   분석 깊이 (cast, mold)
  --auto                     사람 확인 없이 자동 실행 (cast)
  --ref <세션ID>             이전 세션 결과 참조 (cast, assay)

상세 도움말: /crb:help <커맨드명>
─────────────────────────────────────────
```

## 상세 도움말 출력 (커맨드명 지정 시)

해당 커맨드의 `.md` 파일을 읽어 아래 항목을 추출해 출력한다:

- **한 줄 설명**: frontmatter `description`
- **사용법**: 커맨드 파일의 플래그·인수 파싱 섹션
- **예시**: 커맨드 파일에 있는 예시
- **관련 커맨드**: 연계해서 쓰면 좋은 커맨드

파일 경로: `.claude-plugin/../commands/{커맨드명}.md` (플러그인 설치 경로 기준)

커맨드명을 찾을 수 없으면:
```
알 수 없는 커맨드: '<입력값>'
사용 가능한 커맨드: cast, mold, forge, smelt, assay, security, challenge, debug, auto, stats, status, result, setup
```

## Gotchas

- 버전 번호는 plugin.json의 `version` 필드에서 읽는다
- 파일 읽기 실패 시 에러 없이 전체 요약만 출력한다
- 출력 파일을 저장하지 않는다 — 터미널 출력만
