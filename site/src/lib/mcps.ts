export interface McpCapability {
  title: string
  description: string
}

export interface McpSetup {
  target: string
  description: string
  type: 'cmd' | 'config'
  label: string
  code: string
  note?: string
}

export interface McpAlternative {
  name: string
  description: string
  setup: McpSetup[]
}

export interface Mcp {
  name: string
  displayName: string
  maintainer: string
  maintainerUrl: string
  description: string
  longDescription: string
  capabilities: McpCapability[]
  tags: string[]
  repoUrl: string
  setup: McpSetup[]
  alternative?: McpAlternative
}

export const mcps: Mcp[] = [
  {
    name: 'filesystem',
    displayName: 'Filesystem',
    maintainer: 'Anthropic',
    maintainerUrl: 'https://github.com/modelcontextprotocol/servers',
    description: '로컬 파일시스템을 읽고 쓰는 공식 MCP. 지정한 디렉토리 안에서만 동작한다.',
    longDescription:
      'Anthropic이 관리하는 공식 MCP 서버 모음(modelcontextprotocol/servers)에 포함된 Filesystem MCP다.\n' +
      'Claude가 로컬 파일시스템에 직접 접근할 수 있게 해준다.\n\n' +
      '설정에서 허용한 디렉토리 경로 범위 안에서만 동작하며, 그 밖의 경로는 접근이 차단된다.\n' +
      '별도 API 키나 외부 서비스 없이 Node.js만 있으면 바로 실행할 수 있다.',
    capabilities: [
      {
        title: '파일 읽기 / 쓰기',
        description:
          '텍스트 파일을 읽거나 새 내용을 작성한다. 코드 파일, 설정 파일, 마크다운 문서 등을 Claude가 직접 열어보거나 수정할 수 있다.',
      },
      {
        title: '디렉토리 탐색',
        description:
          '폴더 구조를 탐색하고 파일 목록을 가져온다. 재귀적 트리 구조 조회, 파일 크기 포함 목록 등을 지원한다.',
      },
      {
        title: '파일 이동 / 이름 변경',
        description:
          '파일이나 폴더를 다른 경로로 이동하거나 이름을 바꾼다. 일괄 파일 정리, 리팩토링 후 파일 구조 재편 등에 쓸 수 있다.',
      },
      {
        title: '파일 생성 / 삭제',
        description:
          '새 파일이나 폴더를 만들거나 삭제한다. 중첩 디렉토리 생성도 지원한다.',
      },
      {
        title: '파일 검색',
        description:
          'Glob 패턴으로 파일을 찾는다. 여러 파일에 걸친 특정 패턴을 Claude가 직접 탐색할 수 있다.',
      },
      {
        title: '메타데이터 조회',
        description:
          '파일 크기, 수정 날짜, 권한 등의 메타데이터를 확인한다.',
      },
      {
        title: '이미지 / 미디어 파일 읽기',
        description:
          '이미지, 오디오 등 미디어 파일을 Base64로 읽는다.',
      },
    ],
    tags: ['official', 'filesystem', 'local'],
    repoUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
    setup: [
      {
        target: 'Claude Desktop',
        description:
          '~/Library/Application Support/Claude/claude_desktop_config.json 에 아래 내용을 추가한다.\n' +
          '경로는 접근을 허용할 실제 디렉토리로 교체하세요. 여러 경로를 args 배열에 추가할 수 있습니다.',
        type: 'config',
        label: 'claude_desktop_config.json',
        code: JSON.stringify(
          {
            mcpServers: {
              filesystem: {
                command: 'npx',
                args: [
                  '-y',
                  '@modelcontextprotocol/server-filesystem',
                  '/Users/your-username/Desktop',
                  '/Users/your-username/Documents',
                ],
              },
            },
          },
          null,
          2
        ),
      },
      {
        target: 'Claude Code',
        description: '터미널에서 아래 명령어를 실행한다. 경로는 허용할 디렉토리로 교체하세요.',
        type: 'cmd',
        label: 'terminal',
        code: 'claude mcp add filesystem -- npx -y @modelcontextprotocol/server-filesystem /path/to/dir',
        note: '기본값은 현재 프로젝트에만 등록(local). 모든 프로젝트에서 쓰려면 --scope user를 추가하세요.',
      },
    ],
  },
  {
    name: 'github',
    displayName: 'GitHub',
    maintainer: 'GitHub',
    maintainerUrl: 'https://github.com/github/github-mcp-server',
    description: 'GitHub 공식 MCP. 이슈, PR, 코드, Actions 등 GitHub 전반을 Claude가 직접 다룰 수 있게 한다.',
    longDescription:
      'GitHub이 직접 만들고 관리하는 공식 MCP 서버다.\n' +
      'Claude가 GitHub API를 통해 리포지토리 관리, 이슈/PR 처리, 코드 탐색, CI/CD 모니터링 등을 수행할 수 있게 된다.\n\n' +
      '2025년 4월부터 기존 npm 패키지(@modelcontextprotocol/server-github)는 지원 종료되었다.\n' +
      'Docker, 사전 빌드된 바이너리, 또는 GitHub가 호스팅하는 Remote MCP 서버를 사용해야 한다.\n\n' +
      '단, Claude Code 환경에서는 gh CLI가 이미 같은 역할을 더 가볍게 수행할 수 있다.',
    capabilities: [
      {
        title: '이슈 읽기 / 쓰기',
        description:
          '이슈를 조회하고 새로 만들거나 댓글을 달고 상태를 바꾼다.',
      },
      {
        title: 'PR 생성 / 관리',
        description:
          'Pull Request를 열고, 리뷰 댓글을 달고, 머지한다.',
      },
      {
        title: '코드 검색',
        description:
          'GitHub 전체 또는 특정 리포지토리에서 코드를 검색한다.',
      },
      {
        title: '파일 읽기 / 쓰기',
        description:
          '리포지토리 내 파일을 읽거나 커밋과 함께 수정한다. 로컬 클론 없이도 GitHub 상의 파일을 직접 편집할 수 있다.',
      },
      {
        title: 'GitHub Actions 모니터링',
        description:
          '워크플로우 실행 상태를 조회하고 빌드 실패를 분석한다.',
      },
      {
        title: '브랜치 / 태그 / 릴리즈 관리',
        description:
          '브랜치를 만들고 태그와 릴리즈를 관리한다.',
      },
      {
        title: '보안 스캔 / Dependabot',
        description:
          '코드 보안 알림을 검토하고 Dependabot PR을 관리한다.',
      },
    ],
    tags: ['official', 'github', 'remote'],
    repoUrl: 'https://github.com/github/github-mcp-server',
    setup: [
      {
        target: 'Claude Desktop — Remote MCP (설치 불필요)',
        description:
          'GitHub이 호스팅하는 Remote MCP 서버로 연결한다. 로컬 설치 없이 OAuth 또는 PAT로 인증한다.\n' +
          'GITHUB_PERSONAL_ACCESS_TOKEN을 먼저 환경 변수로 설정해두세요.',
        type: 'config',
        label: 'claude_desktop_config.json',
        code: JSON.stringify(
          {
            mcpServers: {
              github: {
                type: 'http',
                url: 'https://api.githubcopilot.com/mcp/',
                headers: {
                  Authorization: 'Bearer ${input:github_mcp_pat}',
                },
              },
            },
          },
          null,
          2
        ),
        note: 'github.com/settings/tokens 에서 PAT를 발급하세요. 필요 스코프: repo, read:org, read:packages',
      },
      {
        target: 'Claude Desktop — Docker (로컬 실행)',
        description:
          'Docker로 GitHub MCP를 로컬에서 실행한다. Docker가 설치되어 있어야 한다.\n' +
          'GITHUB_PERSONAL_ACCESS_TOKEN은 env 필드에 직접 입력하거나, 환경 변수를 미리 설정하고 참조하세요.',
        type: 'config',
        label: 'claude_desktop_config.json',
        code: JSON.stringify(
          {
            mcpServers: {
              github: {
                command: 'docker',
                args: [
                  'run', '-i', '--rm',
                  '-e', 'GITHUB_PERSONAL_ACCESS_TOKEN',
                  'ghcr.io/github/github-mcp-server',
                ],
                env: {
                  GITHUB_PERSONAL_ACCESS_TOKEN: '<YOUR_TOKEN>',
                },
              },
            },
          },
          null,
          2
        ),
        note: 'docker.com/get-started 에서 Docker를 먼저 설치하세요.',
      },
      {
        target: 'Claude Code',
        description:
          'PAT를 먼저 환경 변수로 export한 뒤 아래 명령어를 실행한다.\n' +
          '토큰을 커맨드에 직접 입력하면 shell history에 남으므로, $변수 참조 방식을 권장한다.',
        type: 'cmd',
        label: 'terminal',
        code: 'export GITHUB_PERSONAL_ACCESS_TOKEN=your_token_here\nclaude mcp add github -e GITHUB_PERSONAL_ACCESS_TOKEN=$GITHUB_PERSONAL_ACCESS_TOKEN -- docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server',
        note: '기본값은 현재 프로젝트에만 등록(local). 모든 프로젝트에서 쓰려면 --scope user를 추가하세요.',
      },
    ],
    alternative: {
      name: 'GitHub CLI (gh)',
      description:
        'Claude Code 환경에서는 MCP 대신 gh CLI를 쓰는 경우가 많다.\n' +
        'gh가 설치되어 있고 로그인된 상태라면, Claude Code는 Bash를 통해 gh 명령어를 직접 실행할 수 있다.\n' +
        'Docker나 PAT 설정 없이도 동일한 작업 대부분을 처리할 수 있어 Claude Code 사용자에게는 더 가벼운 선택지다.\n\n' +
        'Claude Desktop에서는 Bash 접근이 없으므로 gh CLI를 활용할 수 없다. MCP를 사용해야 한다.',
      setup: [
        {
          target: 'macOS',
          description: 'Homebrew로 설치한다.',
          type: 'cmd',
          label: 'terminal',
          code: 'brew install gh',
        },
        {
          target: '로그인',
          description: '설치 후 GitHub 계정으로 인증한다. 브라우저가 열리며 OAuth 인증이 진행된다.',
          type: 'cmd',
          label: 'terminal',
          code: 'gh auth login',
        },
      ],
    },
  },
  {
    name: 'slack',
    displayName: 'Slack',
    maintainer: 'Anthropic',
    maintainerUrl: 'https://github.com/modelcontextprotocol/servers-archived',
    description: '워크스페이스의 채널과 메시지를 읽고 쓰는 MCP. 현재 archived 상태로 더 이상 유지보수되지 않는다.',
    longDescription:
      '원래 Anthropic의 공식 MCP 서버 모음에 포함되어 있었으나, 현재는 archived 상태다.\n' +
      '기능은 동작하지만 더 이상 보안 업데이트나 새 기능 추가가 이루어지지 않는다.\n\n' +
      'Slack Bot Token(xoxb-...)과 Team ID가 필요하다.\n' +
      'api.slack.com/apps 에서 앱을 생성하고 필요한 Bot Token Scope를 부여한 뒤 워크스페이스에 설치하면 발급된다.',
    capabilities: [
      {
        title: '채널 메시지 읽기',
        description: '특정 채널의 메시지 히스토리를 가져온다.',
      },
      {
        title: '메시지 보내기',
        description: '채널에 새 메시지를 작성하거나 스레드에 답글을 단다.',
      },
      {
        title: '반응(Reaction) 추가',
        description: '메시지에 이모지 반응을 추가한다.',
      },
      {
        title: '채널 목록 조회',
        description: '워크스페이스의 채널 목록과 각 채널 정보를 가져온다.',
      },
      {
        title: '유저 정보 조회',
        description: '워크스페이스 멤버 목록과 유저 프로필을 조회한다.',
      },
    ],
    tags: ['archived', 'slack', 'messaging'],
    repoUrl: 'https://github.com/modelcontextprotocol/servers-archived/tree/main/src/slack',
    setup: [
      {
        target: 'Claude Desktop',
        description:
          '~/Library/Application Support/Claude/claude_desktop_config.json 에 아래 내용을 추가한다.\n' +
          'api.slack.com/apps 에서 앱을 만들고 Bot Token과 Team ID를 발급받아 교체하세요.\n' +
          'SLACK_CHANNEL_IDS는 선택사항으로, 설정하면 해당 채널에만 접근을 제한할 수 있다.',
        type: 'config',
        label: 'claude_desktop_config.json',
        code: JSON.stringify(
          {
            mcpServers: {
              slack: {
                command: 'npx',
                args: ['-y', '@modelcontextprotocol/server-slack'],
                env: {
                  SLACK_BOT_TOKEN: 'xoxb-your-bot-token',
                  SLACK_TEAM_ID: 'T0123456789',
                },
              },
            },
          },
          null,
          2
        ),
        note: '필요한 Bot Token Scopes: channels:history, channels:read, chat:write, reactions:write, users:read, users.profile:read',
      },
      {
        target: 'Claude Code',
        description:
          '토큰을 커맨드에 직접 입력하면 shell history에 남으므로, 환경 변수를 먼저 export하고 참조하는 방식을 권장한다.',
        type: 'cmd',
        label: 'terminal',
        code: 'export SLACK_BOT_TOKEN=xoxb-your-token\nexport SLACK_TEAM_ID=T0123456789\nclaude mcp add slack -e SLACK_BOT_TOKEN=$SLACK_BOT_TOKEN -e SLACK_TEAM_ID=$SLACK_TEAM_ID -- npx -y @modelcontextprotocol/server-slack',
        note: '기본값은 현재 프로젝트에만 등록(local). 모든 프로젝트에서 쓰려면 --scope user를 추가하세요.',
      },
    ],
  },
  {
    name: 'atlassian',
    displayName: 'Atlassian',
    maintainer: 'Atlassian',
    maintainerUrl: 'https://www.atlassian.com/platform/remote-mcp-server',
    description: 'Jira와 Confluence를 Claude가 직접 다룰 수 있게 하는 Atlassian 공식 Remote MCP. OAuth로 인증하며 별도 API 키가 필요 없다.',
    longDescription:
      'Atlassian이 직접 운영하는 공식 Remote MCP 서버다.\n' +
      'Claude가 Jira 이슈 관리, Confluence 페이지 읽기/쓰기 등을 자연어로 처리할 수 있게 한다.\n\n' +
      '인증은 OAuth 방식으로, 설정 후 /mcp 커맨드에서 Authenticate를 클릭하면 브라우저 로그인이 열린다.\n' +
      '특정 Atlassian 워크스페이스 도메인을 선택해 연결하는 방식으로 API 키가 전혀 필요 없다.\n\n' +
      'Atlassian의 보안 프록시를 통해 동작하며, 사용자 로그인 권한 범위 내에서만 작동한다.\n' +
      'Jira와 Confluence 콘텐츠는 캐싱되지 않는다.',
    capabilities: [
      {
        title: 'Jira 이슈 읽기 / 쓰기',
        description: '이슈를 조회하고 새로 만들거나 상태를 변경하고 댓글을 단다.',
      },
      {
        title: 'JQL 검색',
        description: 'Jira Query Language로 이슈를 검색한다. 담당자, 상태, 프로젝트, 날짜 조건 등을 조합할 수 있다.',
      },
      {
        title: 'Confluence 페이지 읽기 / 쓰기',
        description: 'Confluence 스페이스의 페이지를 읽고 새 페이지를 만들거나 기존 페이지를 수정한다.',
      },
      {
        title: '스프린트 / 보드 정보 조회',
        description: 'Jira 프로젝트 목록, 스프린트 현황, 보드 정보를 가져온다.',
      },
    ],
    tags: ['official', 'jira', 'confluence'],
    repoUrl: 'https://github.com/atlassian/atlassian-mcp-server',
    setup: [
      {
        target: 'Claude Desktop',
        description:
          '~/Library/Application Support/Claude/claude_desktop_config.json 에 아래 내용을 추가한다.\n' +
          '설정 후 Claude를 재시작하고, /mcp 커맨드에서 atlassian → Authenticate를 클릭해 OAuth 로그인을 완료하세요.',
        type: 'config',
        label: 'claude_desktop_config.json',
        code: JSON.stringify(
          {
            mcpServers: {
              atlassian: {
                type: 'http',
                url: 'https://mcp.atlassian.com/v1/mcp',
              },
            },
          },
          null,
          2
        ),
        note: 'API 키 불필요. OAuth로 인증하며 연결할 Atlassian 워크스페이스를 브라우저에서 선택합니다.',
      },
      {
        target: 'Claude Code',
        description:
          '아래 명령어로 Remote MCP를 추가한다. API 키 없이 OAuth로 인증한다.\n' +
          '설정 후 /mcp 커맨드에서 atlassian → Authenticate를 클릭해 로그인하세요.',
        type: 'cmd',
        label: 'terminal',
        code: 'claude mcp add --transport http atlassian https://mcp.atlassian.com/v1/mcp',
        note: '기본값은 현재 프로젝트에만 등록(local). 모든 프로젝트에서 쓰려면 --scope user를 추가하세요.',
      },
    ],
    alternative: {
      name: 'Atlassian CLI',
      description:
        'Jira 작업에 한해 CLI 도구를 대안으로 쓸 수 있다.\n' +
        'go-jira를 설치하면 Claude Code가 Bash를 통해 Jira 이슈를 조회·생성·업데이트할 수 있다.\n\n' +
        '단, Confluence는 지원하지 않으며 Jira 전용이다.',
      setup: [
        {
          target: 'macOS',
          description: 'Homebrew로 go-jira CLI를 설치한다.',
          type: 'cmd',
          label: 'terminal',
          code: 'brew install go-jira',
        },
        {
          target: '로그인',
          description: '~/.config/jira/config.yml 에 Atlassian 도메인과 이메일을 설정하거나 아래 명령으로 인증한다.',
          type: 'cmd',
          label: 'terminal',
          code: 'jira session login --endpoint=https://your-company.atlassian.net --user=you@example.com',
        },
      ],
    },
  },
  {
    name: 'figma',
    displayName: 'Figma',
    maintainer: 'Figma',
    maintainerUrl: 'https://github.com/figma/figma-developer-mcp',
    description: 'Figma 파일과 컴포넌트를 Claude가 읽고 쓸 수 있게 하는 Figma 공식 MCP. OAuth로 인증하며 별도 API 키가 필요 없다.',
    longDescription:
      'Figma가 직접 만들고 관리하는 공식 MCP 서버다.\n' +
      'Claude가 Figma 파일의 레이아웃, 컴포넌트, 스타일 정보를 읽고 직접 Figma 파일에 콘텐츠를 생성·수정하는 작업을 할 수 있다.\n\n' +
      '인증은 OAuth 방식만 지원한다. Personal Access Token은 MCP 서버 수준에서 지원하지 않는다.\n' +
      '설정 후 /mcp 커맨드에서 Authenticate를 클릭해 브라우저 OAuth 로그인을 완료하면 된다.\n\n' +
      'Remote MCP 서버(https://mcp.figma.com/mcp)에 연결하는 방식을 사용한다.',
    capabilities: [
      {
        title: '파일 구조 읽기',
        description:
          'Figma 파일의 전체 레이어 구조와 프레임 목록을 가져온다.',
      },
      {
        title: '컴포넌트 스펙 조회',
        description:
          '특정 컴포넌트의 크기, 색상, 폰트, 간격 등 디자인 스펙을 정확히 읽는다.',
      },
      {
        title: '스타일 / 변수 추출',
        description:
          '색상 팔레트, 타이포그래피, 변수 등 파일에 정의된 디자인 토큰을 가져온다.',
      },
      {
        title: 'Figma 파일에 직접 쓰기',
        description:
          '프레임, 컴포넌트, 변수, 자동 레이아웃을 Figma 파일에 직접 생성·수정한다. 현재 베타 기간 중 무료이며 향후 사용량 기반 과금으로 전환 예정이다.',
      },
      {
        title: '디자인 → 코드 변환',
        description:
          'Figma 컴포넌트 스펙을 읽어 React, HTML/CSS 등 실제 코드를 생성한다.',
      },
    ],
    tags: ['official', 'figma', 'design'],
    repoUrl: 'https://github.com/figma/figma-developer-mcp',
    setup: [
      {
        target: 'Claude Desktop — Remote MCP (권장)',
        description:
          '~/Library/Application Support/Claude/claude_desktop_config.json 에 아래 내용을 추가한다.\n' +
          '설정 후 Claude를 재시작하고, /mcp 커맨드에서 figma → Authenticate를 클릭해 OAuth 로그인을 완료하세요.',
        type: 'config',
        label: 'claude_desktop_config.json',
        code: JSON.stringify(
          {
            mcpServers: {
              figma: {
                type: 'http',
                url: 'https://mcp.figma.com/mcp',
              },
            },
          },
          null,
          2
        ),
        note: 'API 키 불필요. OAuth로 인증하며 액세스 토큰 유효 기간은 90일입니다.',
      },
      {
        target: 'Claude Code',
        description:
          '아래 명령어로 Remote MCP를 추가한다. API 키 없이 OAuth로 인증한다.\n' +
          '설정 후 /mcp 커맨드에서 figma → Authenticate를 클릭해 로그인하세요.',
        type: 'cmd',
        label: 'terminal',
        code: 'claude mcp add --transport http figma https://mcp.figma.com/mcp',
        note: '기본값은 현재 프로젝트에만 등록(local). 모든 프로젝트에서 쓰려면 --scope user를 추가하세요.',
      },
    ],
  },
]
