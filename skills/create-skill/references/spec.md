# Agent Skills 형식 스펙

출처: https://agentskills.io/specification

## frontmatter 필드

| 필드 | 필수 | 제약사항 |
|------|------|----------|
| `name` | 필수 | 1~64자. 소문자 `a-z`, 숫자, 하이픈만. 연속 `--` 불가. 앞뒤 `-` 불가. 디렉토리명과 일치해야 함. |
| `description` | 필수 | 1~1024자. 스킬이 하는 일 + 언제 사용하는지 포함. |
| `license` | 선택 | 라이선스 이름 또는 동봉된 라이선스 파일 경로. |
| `compatibility` | 선택 | 1~500자. 특정 환경 요구사항이 있을 때만 작성 (시스템 패키지, 네트워크, Python 버전 등). 대부분의 스킬은 불필요. |
| `metadata` | 선택 | 자유로운 key-value 맵. 키 이름은 충돌 방지를 위해 고유하게 작성. |
| `allowed-tools` | 선택 | 공백으로 구분된 도구 목록. 실험적 기능 — 클라이언트마다 지원 여부 다름. |

## Claude Code 전용 확장 필드 (스펙 외 추가)

| 필드 | 효과 |
|------|------|
| `disable-model-invocation: true` | 사용자 직접 호출만 가능 (`/스킬명`). 부작용이 있는 작업(배포, 전송, 커밋)에 사용. |
| `user-invocable: false` | Claude만 자동 활성화. 사용자가 직접 호출 불가. 배경 지식에 사용. |
| `context: fork` | 격리된 서브에이전트 컨텍스트에서 실행. |
| `agent: Explore` | `context: fork` 시 사용할 에이전트 타입. |
| `tools` | Claude Code에서 `allowed-tools`의 별칭. |

## name 필드 규칙

```yaml
# 유효한 예
name: pdf-processing
name: data-analysis
name: code-review-v2

# 무효한 예
name: PDF-Processing      # 대문자 불가
name: -pdf                # 하이픈으로 시작 불가
name: pdf--processing     # 연속 하이픈 불가
name: pdf-                # 하이픈으로 끝 불가
name: this-name-is-way-too-long-and-exceeds-sixty-four-characters-limit  # 64자 초과
```

## description 작성 팁

- 트리거 조건: "~할 때 이 스킬을 사용한다"
- 키워드 미언급 케이스 포함: "~라고 명시하지 않더라도"
- 인접 스킬과의 경계 명시: "~는 이 스킬을 사용하지 않는다"
- 하드 제한: 1024자

## Progressive Disclosure 토큰 예산

| 레이어 | 로드 시점 | 권장 크기 |
|--------|-----------|----------|
| `name` + `description` | 항상 (시작 시) | ~100 토큰 |
| `SKILL.md` 본문 | 스킬 활성화 시 | 5000 토큰 이하, 500줄 이하 |
| `references/`, `scripts/`, `assets/` | 명시적으로 필요할 때 | 제한 없음 |

## 파일 참조 규칙

항상 스킬 루트 기준 상대 경로 사용:

```markdown
200 아닌 응답 시 [references/api-errors.md](references/api-errors.md) 읽기.
실행: scripts/validate.py
```

참조는 1단계 깊이로 유지. `references/deep/nested/file.md` 같은 중첩 체인 피할 것.
