# claude-foundation

Claude Code를 위한 Skills · Plugins 모음입니다.

## Skills

| 스킬 | 설명 |
|------|------|
| [create-skill](skills/create-skill/) | agentskills.io 스펙 기반 새 스킬 제작 |
| [auto-commit](skills/auto-commit/) | 변경사항을 분석해 커밋 메시지 자동 생성 및 커밋 실행 |
| [configure-notifications](skills/configure-notifications/) | macOS 시스템 알림 · Slack 웹훅 알림 설정 |

### 스킬 설치

```bash
# 전체 스킬 설치
npx skills add astamvalley/claude-foundation

# 특정 스킬만 설치
npx skills add astamvalley/claude-foundation --skill create-skill -a claude-code
npx skills add astamvalley/claude-foundation --skill auto-commit -a claude-code
```

## Plugins

Claude Code 네이티브 플러그인 시스템으로 설치하는 플러그인 모음입니다.

스킬(agentskills.io)과 달리 플러그인은 Claude Code의 `/plugin` 명령어로 관리하며,
`plugin-name:skill-name` 형식의 네임스페이스를 갖습니다.

| 플러그인 | 명령어 | 설명 |
|----------|--------|------|
| [crb](plugins/crb/) | `/crb:cast`, `/crb:setup` | 다각도 분석 기반 범용 기획 플러그인 (crucible) |

### 플러그인 설치

이 레포를 로컬에 클론한 뒤 마켓플레이스로 등록해 설치합니다.

```bash
# 1. 레포 클론
git clone https://github.com/astamvalley/claude-foundation
cd claude-foundation

# 2. Claude Code에서 마켓플레이스 등록 (한 번만)
/plugin marketplace add /절대경로/claude-foundation

# 3. 플러그인 설치
/plugin install crb

# 4. 업데이트할 때
git pull
/reload-plugins
```

#### marketplace.json이란?

`.claude-plugin/marketplace.json`은 이 레포가 어떤 플러그인을 제공하는지 Claude Code에 알려주는 레지스트리 파일입니다.
`/plugin marketplace add`는 이 파일을 읽어 설치 가능한 플러그인 목록을 파악합니다.
새 플러그인을 추가할 때마다 이 파일에도 항목을 추가해야 합니다.

## 구조

```
claude-foundation/
├── .claude-plugin/
│   └── marketplace.json   # 플러그인 레지스트리
├── skills/                # agentskills.io 스킬
│   ├── create-skill/
│   ├── auto-commit/
│   └── configure-notifications/
├── plugins/               # Claude Code 네이티브 플러그인
│   └── crb/
│       ├── .claude-plugin/
│       │   └── plugin.json
│       └── skills/
│           ├── cast/      # /crb:cast
│           └── setup/     # /crb:setup
└── site/                  # Skills · Plugins 브라우저 (Next.js)
```

## 호환 도구

- **Skills**: Claude Code, Cursor, VS Code Copilot, Gemini CLI 등 [agentskills.io](https://agentskills.io) 호환 도구
- **Plugins**: Claude Code 전용
