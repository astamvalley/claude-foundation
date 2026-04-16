---
name: crb-team
description: 모드 결정 내부 스킬. --team/--solo 플래그 파싱, Agent Teams 상태 감지, Solo/Team 모드 선택 로직을 정의한다. 모든 커맨드(debug 제외)가 실행 전 이 스킬을 참조한다.
user-invocable: false
---

# crb-team

커맨드 실행 전 Solo/Team 모드를 결정한다.

## Agent Teams 상태 확인

```bash
node -e "const fs=require('fs'),os=require('os'),path=require('path'); \
  const f=path.join(os.homedir(),'.claude','settings.json'); \
  const s=fs.existsSync(f)?JSON.parse(fs.readFileSync(f)):{}; \
  console.log((s.env||{}).CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS||'0');"
```

- `1` → Agent Teams 활성화됨
- 그 외 → 비활성화

## 모드 결정 흐름

아래 순서로 모드를 결정한다:

```
입력에서 플래그 파싱
│
├─ --team 감지?
│   ├─ Agent Teams 활성화 → Team 모드 즉시 반환
│   └─ Agent Teams 비활성화 →
│         "⚠️ Agent Teams가 활성화되지 않았습니다. Solo 모드로 실행합니다.
│          활성화: ~/.claude/settings.json → env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS = \"1\""
│         → Solo 모드 반환
│
├─ --solo 감지? → Solo 모드 즉시 반환
│
├─ --auto 감지? (mode 플래그 없이) → Solo 모드 즉시 반환 (묻지 않음)
│
├─ --depth quick 감지? (mode 플래그 없이) → Solo 모드 즉시 반환
│
└─ 플래그 없음?
    ├─ Agent Teams 활성화 →
    │     AskUserQuestion으로 1회 묻는다:
    │       "실행 모드를 선택하세요.
    │        > Solo — 빠르고 저렴한 병렬 분석 (Subagent)
    │        > Team — 에이전트 간 토론으로 깊은 분석 (Agent Teams)"
    │     --depth deep일 때 Team에 (Recommended) 표시
    │
    └─ Agent Teams 비활성화 → Solo 모드 즉시 반환 (선택지 없음)
```

## --depth 연동

| depth | mode 플래그 없을 때 |
|-------|-------------------|
| `--depth quick` | Solo 강제 |
| `--depth standard` | 선택지 표시 |
| `--depth deep` | 선택지 표시, Team에 `(Recommended)` |

## 반환값

모드 결정 결과를 컨텍스트에 기록한다:

```
mode = "solo" | "team"
```

이후 커맨드는 이 값을 기준으로 Solo 또는 Team 워크플로우를 실행한다.

## Team 모드 지원 현황

| 커맨드 | Solo | Team |
|--------|:----:|:----:|
| cast | v1.1.0 | v1.3.0 |
| mold | v1.1.0 | v1.7.0 |
| forge | v1.4.0 | v1.8.0 |
| smelt | v2.0.0 | v2.0.0 (--team/--solo를 내부 mold·forge에 전달) |
| assay | v1.1.0 | v1.5.0 |
| security | v1.1.0 | v1.5.0 |
| challenge | v1.1.0 | v1.7.0 |
| debug | v1.1.0 | Solo 고정 |

Team 모드가 아직 구현되지 않은 커맨드에서 `--team`을 사용하면:
```
"ℹ️ <커맨드> Team 모드는 준비 중입니다. Solo 모드로 실행합니다."
```

## Gotchas

- Agent Teams 상태 확인은 모드 결정 시 매번 실행할 것
- AskUserQuestion은 정확히 1회만 — 재질문 금지
- `--auto`와 `--team`을 함께 쓰면 Team 즉시 실행 (묻지 않음)
- `--background`와 함께 쓸 수 있음: 모드 선택 후 백그라운드 실행
