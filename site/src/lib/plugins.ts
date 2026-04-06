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
  {
    name: 'claude-octopus',
    repo: 'nyldn/claude-octopus',
    packageName: 'octo@nyldn-plugins',
    author: 'nyldn',
    description: '최대 8개 AI 프로바이더를 동시에 오케스트레이션해 서로의 맹점을 교차 검증하는 Claude Code 플러그인.',
    longDescription:
      '모든 AI 모델에는 맹점이 있다. Claude Octopus는 Codex, Gemini, Copilot, Qwen, Ollama, Perplexity, OpenRouter를 Claude Code와 함께 최대 8개까지 동시에 투입하고, 75% 합의 게이트로 불일치를 배포 전에 걸러낸다.\n\n' +
      'UK Design Council의 Double Diamond 방법론을 따른다. Discover → Define → Develop → Deliver 4단계를 순차 진행하며, 각 단계마다 합의 임계값이 점진적으로 높아진다. 단계별로 개별 실행하거나 `/octo:embrace` 한 번으로 전체 파이프라인을 돌릴 수 있다.\n\n' +
      '32개 전문가 페르소나(security-auditor, backend-architect, ui-ux-designer 등)가 요청 맥락에 따라 자동 활성화된다. Smart Router(`/octo:auto`)는 자연어 의도를 파싱해 최적 워크플로우를 자동 선택하므로 커맨드를 외울 필요가 없다.\n\n' +
      'Dark Factory 모드(`/octo:factory`)는 스펙만 주면 사람 개입 없이 전체 파이프라인을 자율 실행한다. Reaction Engine은 CI 실패·리뷰 코멘트를 감지해 자동으로 대응하며, claude-mem 연동으로 세션 간 컨텍스트를 유지한다.\n\n' +
      '외부 프로바이더가 하나도 없어도 Claude만으로 동작한다. Codex·Gemini·Copilot·Qwen·Ollama 5개는 기존 구독이나 무료 티어로 추가 비용 없이 사용 가능하다.',
    tags: ['multi-llm', 'orchestration', 'review', 'research'],
    requirements: [
      'Claude Code v2.1.83 이상',
      'Node.js 18 이상',
      '외부 프로바이더 없이도 동작 — Claude 기본 내장',
      '선택: Codex CLI, Gemini CLI, GitHub Copilot, Qwen API Key, Ollama(로컬), Perplexity API Key, OpenRouter API Key',
    ],
    installSteps: [
      '/plugin marketplace add https://github.com/nyldn/claude-octopus.git',
      '/plugin install octo@nyldn-plugins',
      '/octo:setup',
    ],
    commands: [
      {
        name: '/octo:setup',
        description: '초기 설정 마법사. 설치된 프로바이더를 자동 감지하고 누락된 항목을 안내한다. 설치 후 처음 실행하는 커맨드.',
        examples: ['/octo:setup'],
      },
      {
        name: '/octo:auto',
        description: '자연어 의도를 파싱해 최적 워크플로우를 자동 선택·실행하는 Smart Router. 어떤 커맨드를 써야 할지 모를 때 가장 먼저 사용한다. `/octo:auto <의도>` 대신 `octo <의도>` 형식으로도 동작한다.',
        examples: [
          '/octo:auto "이 코드 보안 괜찮은지 확인해줘"',
          '/octo:auto "Redis vs Memcached 비교해줘"',
          '/octo:auto "사용자 인증 구현해줘"',
          'octo research microservices patterns',
        ],
      },
      {
        name: '/octo:embrace',
        description: 'Discover → Define → Develop → Deliver 전체 Double Diamond 라이프사이클을 실행한다. 각 단계마다 합의 게이트를 통과해야 다음으로 넘어간다. 결과물은 ~/.claude-octopus/results/에 저장된다.',
        examples: [
          '/octo:embrace "사용자 인증 시스템 구현"',
          '/octo:embrace "결제 API 리팩토링" --providers claude,codex,gemini',
        ],
      },
      {
        name: '/octo:discover',
        description: 'Double Diamond 1단계만 단독 실행. 여러 프로바이더가 병렬로 리서치를 수행해 넓은 탐색과 가능성 발굴에 집중한다. embrace 없이 단계별로 진행할 때 사용한다.',
        examples: [
          '/octo:discover "사용자 인증 시스템 구현"',
        ],
      },
      {
        name: '/octo:define',
        description: 'Double Diamond 2단계만 단독 실행. Discover에서 수집된 정보를 바탕으로 요구사항을 명확히 정의하고 스코프 합의를 형성한다.',
        examples: [
          '/octo:define "사용자 인증 시스템 구현"',
        ],
      },
      {
        name: '/octo:develop',
        description: 'Double Diamond 3단계만 단독 실행. 여러 프로바이더가 각자 구현을 제안하고 Claude가 최선의 요소를 병합한다.',
        examples: [
          '/octo:develop "사용자 인증 시스템 구현"',
        ],
      },
      {
        name: '/octo:deliver',
        description: 'Double Diamond 4단계만 단독 실행. 적대적 리뷰(adversarial review)를 수행하고 최종 Go/No-Go를 판단한다. 가장 높은 합의 임계값이 적용된다.',
        examples: [
          '/octo:deliver',
        ],
      },
      {
        name: '/octo:factory',
        description: 'Dark Factory 모드. 스펙만 주면 사람 개입 없이 전체 파이프라인(Discover → Deliver)을 자율 실행한다. 각 단계가 아닌 최종 결과물을 리뷰한다.',
        examples: [
          '/octo:factory "파일 업로드 컴포넌트 — drag & drop, 미리보기, 진행률 표시"',
          '/octo:factory "CSV to JSON 변환 CLI 툴"',
        ],
      },
      {
        name: '/octo:debate',
        description: '여러 AI 프로바이더 간 구조화된 토론을 실행한다. 찬반 양측이 근거를 제시하고 합의점을 도출한다. 기술 선택·PRD 검증·아키텍처 결정에 적합하다.',
        examples: [
          '/octo:debate "모노레포 vs 멀티레포"',
          '/octo:debate "GraphQL vs REST for this API"',
          '/octo:debate "이 PRD에서 빠진 엣지케이스는?"',
        ],
      },
      {
        name: '/octo:research',
        description: '여러 프로바이더에 병렬로 리서치 쿼리를 보내 정보 커버리지를 극대화한다. 각 모델이 서로 다른 소스와 관점에서 탐색한 결과를 종합한다.',
        examples: [
          '/octo:research "Next.js 15 App Router 마이그레이션 주의점"',
          '/octo:research "WebSocket vs SSE 실시간 통신"',
          '/octo:research "htmx vs react in 2026"',
        ],
      },
      {
        name: '/octo:review',
        description: '현재 변경사항에 대해 여러 프로바이더가 독립적으로 적대적 코드 리뷰를 수행한다. 결과를 비교해 단일 모델이 놓치는 맹점을 최소화한다.',
        examples: [
          '/octo:review',
          '/octo:review --base main',
          '/octo:review --background',
        ],
      },
      {
        name: '/octo:tdd',
        description: '한 모델이 테스트를 작성하고, 다른 모델이 구현한다. 작성자와 구현자가 독립적이므로 진정한 TDD 검증이 가능하다.',
        examples: [
          '/octo:tdd "이메일 유효성 검증 유틸리티"',
          '/octo:tdd "결제 금액 계산 로직"',
          '/octo:tdd create user auth',
        ],
      },
      {
        name: '/octo:security',
        description: '여러 프로바이더가 각기 다른 취약점 패턴으로 보안 감사를 수행한다. OWASP Top 10, 인증·인가, 입력 검증, 데이터 노출 등을 다각도로 점검한다.',
        examples: [
          '/octo:security',
          '/octo:security --scope auth',
        ],
      },
      {
        name: '/octo:prd',
        description: 'AI 최적화된 PRD(Product Requirements Document)를 작성한다. 100점 스코어링 기준으로 품질을 측정하고 누락된 엣지케이스를 보완한다.',
        examples: [
          '/octo:prd "모바일 체크아웃 리디자인"',
          '/octo:prd "실시간 알림 시스템"',
        ],
      },
      {
        name: '/octo:design',
        description: 'BM25 스타일 인텔리전스를 활용한 UI/UX 디자인 워크플로우를 실행한다. 디자인 시스템, 컴포넌트 스펙, 접근성 가이드를 함께 생성한다.',
        examples: [
          '/octo:design "모바일 체크아웃 리디자인"',
          '/octo:design "대시보드 레이아웃"',
        ],
      },
      {
        name: '/octo:doctor',
        description: '환경 진단 도구. 프로바이더 연결 상태, 인증, 버전 호환성을 점검하고 토큰 최적화 팁을 제공한다. octo-compress 파이프(bin/octo-compress) 설치도 안내하며, PostToolUse 훅과 연동해 세션당 약 7,300 토큰을 자동으로 절약한다.',
        examples: ['/octo:doctor'],
        note: '문제가 생겼을 때 먼저 실행한다. --verbose 플래그로 상세 로그를 확인할 수 있으며, 로그는 ~/.claude-octopus/logs/에 저장된다.',
      },
    ],
    githubUrl: 'https://github.com/nyldn/claude-octopus',
  },
]
