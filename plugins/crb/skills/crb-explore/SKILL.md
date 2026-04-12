---
name: crb-explore
description: crb Explore 단계 내부 스킬. 사용 가능한 모델을 감지하고 3개 에이전트를 병렬로 실행하는 규칙을 정의한다.
user-invocable: false
---

# crb-explore

cast 커맨드의 Explore 단계에서만 사용한다.

## 모델 감지

Explore 시작 전 아래를 병렬로 확인한다:

```bash
codex auth status 2>/dev/null || echo $OPENAI_API_KEY
gemini auth status 2>/dev/null
```

결과에 따라 구성을 결정한다:

| 상황 | Agent A | Agent B | Agent C |
|------|---------|---------|---------|
| Codex + Gemini 모두 인증됨 | Claude | Codex | Gemini |
| Codex만 인증됨 | Claude | Codex | Claude |
| Gemini만 인증됨 | Claude | Gemini | Claude |
| 둘 다 없음 | Claude | Claude | Claude |

구성을 한 줄로 알린다:
```
Explore 구성: Claude / Codex / Gemini
```

## 렌즈 선택 (동적)

주제를 보고 가장 적합한 3개의 렌즈를 직접 선택한다. 렌즈는 매번 주제 맥락에 맞게 새로 선택하며 고정하지 않는다.

| 주제 유형 | 렌즈 예시 |
|-----------|----------|
| 게임 기획 | 플레이어 경험 / 메카닉 설계 / 서사·분위기 |
| 앱/프로덕트 | 사용자 관점 / 기술 실현성 / 비즈니스 가치 |
| 아키텍처 | 확장성 / 유지보수성 / 성능 |
| 창작 | 독창성 / 실현 가능성 / 사용자 반응 |

## 병렬 실행

결정된 구성에 따라 3개를 동시에 실행한다. **순차 실행 금지.**

- **Claude 슬롯**: Agent 도구로 독립 컨텍스트 스폰
- **Codex 슬롯**: `codex "<렌즈> 관점으로 <주제> 분석해줘. 핵심 질문 3개, 주요 기회와 리스크, 핵심 제약이나 가정을 포함해서."`
- **Gemini 슬롯**: `gemini -p "<렌즈> 관점으로 <주제> 분석해줘. 핵심 질문 3개, 주요 기회와 리스크, 핵심 제약이나 가정을 포함해서."`

각 슬롯의 프롬프트 구조:
```
[렌즈] 관점으로 <주제>를 분석해줘.
- 이 렌즈에서 가장 중요한 질문 3개
- 주요 기회와 리스크
- 핵심 제약이나 가정
```

Codex/Gemini 실행 중 오류 발생 시 Claude로 조용히 대체하고 계속 진행한다.

## 실행 데이터 보관

Explore 완료 후 아래 데이터를 컨텍스트에 보관한다. run-log.jsonl 기록은 커맨드 완료 시 `crb-output` 스킬이 처리한다.

```
explore.config.agent_a = "claude"
explore.config.agent_b = "codex | gemini | claude"
explore.config.agent_c = "gemini | claude"
explore.lenses = ["렌즈1", "렌즈2", "렌즈3"]
```
