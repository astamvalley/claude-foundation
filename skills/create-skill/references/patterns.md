# 효과적인 스킬 지침 패턴

출처: https://agentskills.io/skill-creation/best-practices

## 패턴 1: Gotchas 섹션

합리적으로 보이지만 이 환경에서는 틀린 것들을 열거한다.
일반적인 조언("에러 처리를 잘 하세요")이 아닌, 말해주지 않으면 에이전트가 틀리는 구체적인 사실들이다.

```markdown
## Gotchas

- `users` 테이블은 소프트 딜리트 — 쿼리에 반드시 `WHERE deleted_at IS NULL` 포함.
  없으면 비활성 계정이 결과에 섞임.
- user_id(DB) = uid(인증 서비스) = accountId(결제 API) — 모두 같은 값, 이름만 다름.
- /health는 DB 연결이 끊겨도 200 반환. 실제 서비스 상태는 /ready로 확인.
```

**사용 시점**: 거의 모든 스킬. 스킬에서 가치가 가장 높은 내용이다.
**팁**: 실제 작업 중 에이전트를 교정할 때마다 여기에 추가한다.

---

## 패턴 2: 출력 형식 템플릿

형식을 산문으로 설명하는 것보다 구체적인 템플릿이 훨씬 신뢰성 높다.
에이전트는 구체적인 구조에 패턴 매칭을 잘 한다.

```markdown
## 리포트 형식

아래 구조를 사용한다 (해당 분석에 맞게 섹션 조정 가능):

# [분석 제목]

## 요약
[핵심 발견 한 문단]

## 주요 발견
- 근거 데이터가 있는 발견

## 권고사항
1. 구체적이고 실행 가능한 항목
```

**사용 시점**: 리포트, API 문서, 변경 로그, PR 설명 등 일관된 출력 형식이 필요할 때.

---

## 패턴 3: 멀티스텝 체크리스트

```markdown
## 처리 순서

- [ ] 1단계: 양식 분석 (`scripts/analyze_form.py` 실행)
- [ ] 2단계: 필드 매핑 생성 (`fields.json` 편집)
- [ ] 3단계: 매핑 검증 (`scripts/validate_fields.py` 실행)
- [ ] 4단계: 양식 작성 (`scripts/fill_form.py` 실행)
- [ ] 5단계: 출력 확인 (`scripts/verify_output.py` 실행)
```

**사용 시점**: 단계를 건너뛰면 조용히 실패하는 멀티스텝 작업.

---

## 패턴 4: 검증 루프

```markdown
## 수정 워크플로우

1. 수정 작업 수행
2. 검증 실행: `python scripts/validate.py output/`
3. 검증 실패 시:
   - 에러 메시지 확인
   - 문제 수정
   - 검증 재실행
4. 검증 통과할 때만 다음 단계로 진행
```

**사용 시점**: 스크립트나 참조 체크리스트로 정확성을 검증할 수 있는 작업.

---

## 패턴 5: Plan-Validate-Execute

배치 작업이나 파괴적 작업: 중간 계획 파일 생성 → 검증 → 실행.

```markdown
## 마이그레이션 작업

1. 스키마 분석: `python scripts/analyze.py` → `plan.json` 생성
2. `plan.json` 검토 — 모든 작업이 의도한 것인지 확인
3. 검증: `python scripts/validate.py plan.json`
4. 검증 실패 시 `plan.json` 수정 후 재검증
5. 실행: `python scripts/execute.py plan.json`
```

**사용 시점**: 파괴적, 되돌리기 어려운, 또는 배치 작업.

---

## 패턴 6: 조건부 참조 파일 로딩

```markdown
API가 200이 아닌 응답을 반환하면
[references/api-errors.md](references/api-errors.md)에서 알려진 에러 코드와 복구 절차 확인.
```

**사용 시점**: 참조 파일이 있을 때는 항상. 막연한 "references/ 참고"는 효과가 낮다.

---

## 패턴 7: 기본값 제시 (옵션 나열 금지)

```markdown
# 나쁨
pypdf, pdfplumber, PyMuPDF, pdf2image 중 목적에 맞게 선택...

# 좋음
pdfplumber로 텍스트 추출. OCR이 필요한 스캔 문서는 pdf2image + pytesseract 사용.
```

---

## 스크립트 번들링 판단 기준

에이전트가 실행할 때마다 같은 로직을 새로 만든다면 `scripts/`에 번들링할 신호:
- 매번 같은 타입의 차트 생성
- 프로젝트 특화 형식 파싱
- 출력물 스키마 검증

**에이전트용 스크립트 설계 규칙**:
- 인터랙티브 프롬프트 절대 금지 (에이전트는 TTY 없음)
- `--help` 출력이 주요 인터페이스 문서
- stdout → 구조화 데이터 (JSON/CSV); stderr → 진단 메시지
- 가능하면 멱등성 보장 (에이전트가 재시도할 수 있음)
- 파괴적 작업에는 `--dry-run` 플래그
- 에러 메시지: 무엇이 잘못됐는지 + 다음에 무엇을 시도할지
