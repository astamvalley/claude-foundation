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
`plugin-name:command-name` 형식의 네임스페이스를 갖습니다.

| 플러그인 | 커맨드 | 설명 |
|----------|--------|------|
| [crb](plugins/crb/) | `/crb:cast` `/crb:mold` `/crb:assay` `/crb:challenge` `/crb:security` `/crb:debug` | 도가니(crucible) — 다각도 분석으로 기획과 코드를 정제하는 플러그인 |

### 플러그인 설치

이 레포를 로컬에 클론한 뒤 마켓플레이스로 등록해 설치합니다.

```bash
# 1. 레포 클론
git clone https://github.com/astamvalley/claude-foundation

# 2. Claude Code에서 마켓플레이스 등록 (한 번만)
/plugin marketplace add /절대경로/claude-foundation

# 3. 플러그인 설치
/plugin install crb
/reload-plugins

# 업데이트할 때
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
├── skills/                # agentskills.io 스킬 (npx skills add로 설치)
│   ├── create-skill/
│   ├── auto-commit/
│   └── configure-notifications/
├── plugins/               # Claude Code 네이티브 플러그인 (/plugin으로 설치)
│   └── crb/
│       ├── .claude-plugin/
│       │   └── plugin.json
│       ├── README.md
│       └── commands/
│           ├── cast.md        # /crb:cast  — 기획 정제
│           ├── mold.md        # /crb:mold  — 구조 설계
│           ├── assay.md       # /crb:assay — 코드 리뷰
│           ├── challenge.md   # /crb:challenge — 적대적 리뷰
│           ├── security.md    # /crb:security  — 보안 점검
│           ├── debug.md       # /crb:debug     — 에러 분석
│           ├── setup.md       # /crb:setup
│           ├── status.md      # /crb:status
│           └── result.md      # /crb:result
└── site/                  # Skills · Plugins 브라우저 (Next.js)
```

## 스킬 vs 플러그인

| | Skills | Plugins |
|--|--------|----------|
| 설치 | `npx skills add` | `/plugin install` |
| 명령어 형태 | `/skill-name` | `/plugin:command` |
| 호환 도구 | Claude Code, Cursor, VS Code 등 | Claude Code 전용 |

## 호환 도구

- **Skills**: Claude Code, Cursor, VS Code Copilot, Gemini CLI 등 [agentskills.io](https://agentskills.io) 호환 도구
- **Plugins**: Claude Code 전용
