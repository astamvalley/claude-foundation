---
description: >
  crb 플러그인 환경을 설정한다. /crb:setup을 실행하면
  Agent Teams 활성화, RTK 설치 확인, Codex CLI와 Gemini CLI 설치 및 인증을 단계별로 안내한다.
  crb를 처음 사용하기 전, 또는 새 기기에서 환경을 세팅할 때 사용한다.
---

# setup

crb 플러그인이 제대로 동작하는 데 필요한 환경을 단계별로 점검하고 세팅한다.

## 실행 순서

아래 4단계를 순서대로 진행한다. 각 단계에서 현재 상태를 확인하고 필요한 경우 안내한다.

---

### 1단계: RTK 설치 확인 (권장 필수)

```bash
which rtk && rtk --version
```

- 설치됨 → `✅ RTK 확인` 출력 후 다음 단계
- 미설치 → 아래 안내 출력:

```
⚠️  RTK가 설치되지 않았습니다.
RTK(Rust Token Killer)는 Claude Code 작업 중 토큰을 60-90% 절약하는 CLI 프록시입니다.
crb는 여러 Agent를 병렬 실행하므로 RTK 없이는 토큰 소비가 급격히 늘어납니다.

설치하려면: https://github.com/mharrisb1/rtk 참고

설치 없이 계속하려면 Enter를 누르세요.
```

사용자가 계속 선택 시 다음 단계로 진행.

---

### 2단계: Agent Teams 활성화

```bash
node -e "const fs=require('fs'),os=require('os'),path=require('path'); \
  const f=path.join(os.homedir(),'.claude','settings.json'); \
  const s=fs.existsSync(f)?JSON.parse(fs.readFileSync(f)):{}; \
  const env=s.env||{}; \
  console.log(env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS||'not-set');"
```

- `1` → `✅ Agent Teams 활성화됨` 출력 후 다음 단계
- 그 외 → 아래 안내:

```
⚙️  Agent Teams를 활성화합니다.
Agent Teams는 crb의 Explore 단계에서 독립 컨텍스트 병렬 실행을 가능하게 합니다.
```

`~/.claude/settings.json`의 `env` 섹션에 아래를 추가한다:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

파일이 없으면 새로 생성. 기존 내용은 병합(덮어쓰기 금지).
추가 후 **Claude Code 재시작이 필요함**을 안내한다.

---

### 3단계: Codex CLI 확인 (선택)

**설치 확인:**
```bash
which codex && codex --version
```

미설치 시:
```
💡 Codex CLI (선택사항)
Codex가 있으면 Explore 단계에서 다른 모델 관점을, Challenge 단계에서 독립 리뷰를 제공합니다.
없으면 Claude가 대신 수행합니다.

설치하려면: npm install -g @openai/codex
건너뛰려면 Enter를 누르세요.
```

**설치됨 → 인증 확인:**
```bash
codex login status
```

- 인증됨 → `✅ Codex 인증 확인` 출력
- 미인증 → 아래 안내:

```
🔑 Codex 로그인이 필요합니다.

방법 1 (ChatGPT 계정): codex login
방법 2 (API 키):        export OPENAI_API_KEY=sk-...

로그인 후 /crb:setup을 다시 실행하거나 Enter로 건너뛰세요.
```

API 키 방식은 `echo $OPENAI_API_KEY`로 설정 여부 추가 확인.

**Claude Code Codex 플러그인 확인 (추가 선택사항):**

Codex CLI와 별도로, Claude Code의 Codex 플러그인이 설치되어 있으면 Challenge 단계에서 플러그인 런타임을 우선 사용합니다.

```bash
find ~/.claude/plugins -name "codex-companion.mjs" 2>/dev/null | head -1
```

- 경로가 출력되면 → `✅ Codex 플러그인 런타임 확인`
- 출력 없으면 →
  ```
  💡 Claude Code에서 /codex:setup 을 실행하거나
     플러그인 마켓에서 openai-codex 플러그인을 설치하세요.
  ```

---

### 4단계: Gemini CLI 확인 (선택)

**설치 확인:**
```bash
which gemini 2>/dev/null || which gemini-cli 2>/dev/null
```

미설치 시:
```
💡 Gemini CLI (선택사항)
Gemini가 있으면 Explore 단계에서 다른 모델의 관점을 추가할 수 있습니다.
없으면 Claude Agent로 대체합니다.

설치하려면: npm install -g @google/gemini-cli
건너뛰려면 Enter를 누르세요.
```

**설치됨 → 인증 확인:**
```bash
[ -f "$HOME/.gemini/oauth_creds.json" ] && echo "authenticated" || echo "not-authenticated"
```

- 인증됨 → `✅ Gemini 인증 확인` 출력
- 미인증 → 아래 안내:

```
🔑 Gemini 로그인이 필요합니다.

  gemini auth login

브라우저에서 Google 계정으로 로그인 후 /crb:setup을 다시 실행하거나 Enter로 건너뛰세요.
```

---

## 완료 요약

모든 단계 후 아래 형식으로 결과를 출력한다:

```
─────────────────────────────────────────
crb 환경 점검 완료
─────────────────────────────────────────
✅ RTK             설치됨
✅ Agent Teams     활성화됨
✅ Codex CLI       설치됨 + 인증됨
⚪ Gemini CLI      미설치 (선택)
─────────────────────────────────────────
Explore 구성: Claude + Codex + Claude
준비 완료. /crb:cast <주제> 로 시작하세요.
```

Agent Teams를 새로 활성화한 경우:
```
⚠️  Claude Code를 재시작해야 Agent Teams가 적용됩니다.
재시작 후 /crb:cast <주제> 로 시작하세요.
```

## Gotchas

- settings.json 수정 후 반드시 Claude Code 재시작이 필요함을 명시할 것
- settings.json이 없는 경우 새로 생성하되, 기존 파일은 반드시 읽고 병합할 것
- RTK 미설치를 에러로 처리하지 말 것 — 권장이지 필수 아님
- Codex `codex auth status`가 없는 버전이면 `echo $OPENAI_API_KEY`로 fallback
- 인증 미완료 도구는 에러 없이 조용히 건너뜀 — cast가 알아서 fallback 처리함
