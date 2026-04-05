export interface PluginCommand {
  name: string
  description: string
  examples: string[]
  note?: string
}

export interface Plugin {
  name: string
  repo: string // 'openai/codex-plugin-cc'
  packageName: string // 'codex@openai-codex'
  author: string
  description: string
  longDescription: string
  tags: string[]
  requirements: string[]
  installSteps: string[]
  commands: PluginCommand[]
  githubUrl: string
}

export const plugins: Plugin[] = [
  {
    name: 'codex',
    repo: 'openai/codex-plugin-cc',
    packageName: 'codex@openai-codex',
    author: 'OpenAI',
    description: 'Claude Code 안에서 Codex로 코드 리뷰를 받거나 작업을 위임하는 플러그인.',
    longDescription:
      'Claude Code 워크플로우에서 벗어나지 않고 OpenAI Codex를 활용할 수 있게 해주는 플러그인이다.\n\n' +
      '슬래시 커맨드 하나로 현재 변경사항에 대한 코드 리뷰를 즉시 실행하거나, 버그 조사·수정 작업을 백그라운드에서 Codex에 위임할 수 있다.\n\n' +
      '일반 리뷰(`/codex:review`)와 구현을 비판적으로 압박하는 adversarial 리뷰(`/codex:adversarial-review`)를 구분해 제공한다. 백그라운드 실행을 지원해 긴 작업 중에도 Claude 세션을 계속 사용할 수 있다.',
    tags: ['codex', 'review', 'openai'],
    requirements: [
      'ChatGPT 구독(Free 포함) 또는 OpenAI API 키',
      'Node.js 18.18 이상',
    ],
    installSteps: [
      '/plugin marketplace add openai/codex-plugin-cc',
      '/plugin install codex@openai-codex',
      '/reload-plugins',
      '/codex:setup',
    ],
    commands: [
      {
        name: '/codex:review',
        description: '현재 미커밋 변경사항 또는 브랜치 전체에 대한 코드 리뷰를 실행한다. 읽기 전용이며 코드를 수정하지 않는다.',
        examples: [
          '/codex:review',
          '/codex:review --base main',
          '/codex:review --background',
        ],
        note: '멀티파일 변경사항은 시간이 걸릴 수 있어 --background 사용을 권장한다.',
      },
      {
        name: '/codex:adversarial-review',
        description: '구현·설계 결정을 비판적으로 압박하는 steerable 리뷰. 트레이드오프·실패 시나리오·대안을 집중적으로 파고든다.',
        examples: [
          '/codex:adversarial-review',
          '/codex:adversarial-review --base main challenge whether this was the right caching and retry design',
          '/codex:adversarial-review --background look for race conditions and question the chosen approach',
        ],
      },
      {
        name: '/codex:rescue',
        description: '버그 조사, 수정 시도, 이전 Codex 작업 이어받기 등을 Codex에 위임한다. --background, --resume, --fresh, --model, --effort 옵션을 지원한다.',
        examples: [
          '/codex:rescue investigate why the tests started failing',
          '/codex:rescue fix the failing test with the smallest safe patch',
          '/codex:rescue --resume apply the top fix from the last run',
          '/codex:rescue --model gpt-5.4-mini --effort medium investigate the flaky integration test',
          '/codex:rescue --background investigate the regression',
        ],
      },
      {
        name: '/codex:status',
        description: '현재 레포에서 실행 중이거나 최근 완료된 Codex 작업 목록을 보여준다.',
        examples: [
          '/codex:status',
          '/codex:status task-abc123',
        ],
      },
      {
        name: '/codex:result',
        description: '완료된 Codex 작업의 최종 결과를 출력한다. Codex 세션 ID도 함께 제공해 codex resume으로 직접 재개할 수 있다.',
        examples: [
          '/codex:result',
          '/codex:result task-abc123',
        ],
      },
      {
        name: '/codex:cancel',
        description: '진행 중인 백그라운드 Codex 작업을 취소한다.',
        examples: [
          '/codex:cancel',
          '/codex:cancel task-abc123',
        ],
      },
      {
        name: '/codex:setup',
        description: 'Codex 설치 상태와 인증 여부를 확인한다. npm이 있으면 Codex 자동 설치를 제안하며, 리뷰 게이트 활성화·비활성화도 관리한다.',
        examples: [
          '/codex:setup',
          '/codex:setup --enable-review-gate',
          '/codex:setup --disable-review-gate',
        ],
        note: '리뷰 게이트를 켜면 Claude 응답마다 Codex 리뷰가 자동 실행돼 사용량이 빠르게 소모될 수 있다.',
      },
    ],
    githubUrl: 'https://github.com/openai/codex-plugin-cc',
  },
]
