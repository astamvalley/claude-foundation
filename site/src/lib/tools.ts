export interface ToolCommand {
  name: string
  description: string
  examples: string[]
  note?: string
}

export interface ToolCommandGroup {
  category: string
  commands: ToolCommand[]
}

export interface SavingsRow {
  operation: string
  frequency: string
  standard: string
  rtk: string
  savings: string
}

export interface HookRow {
  raw: string
  rewritten: string
}

export interface HookSection {
  description: string
  flow: string[]        // 단계별 흐름 설명
  rewriteTable: HookRow[]
  note?: string
}

export interface Tool {
  name: string
  author: string
  description: string
  longDescription: string
  tags: string[]
  requirements: string[]
  installSteps: string[]
  hookSection?: HookSection
  commandGroups: ToolCommandGroup[]
  savingsTable?: SavingsRow[]
  githubUrl: string
}

export const tools: Tool[] = [
  {
    name: 'rtk',
    author: 'rtk-ai',
    description: 'LLM 토큰 소비를 60-90% 줄이는 CLI 프록시. 단일 Rust 바이너리, 10ms 미만 오버헤드.',
    longDescription:
      'Claude Code를 포함한 10개 AI 코딩 도구에서 동작하는 CLI 프록시다. 명령어 출력이 LLM에 전달되기 전 필터링·압축해 토큰 소비를 60-90% 줄인다.\n\n' +
      '단일 Rust 바이너리로 설치가 간단하고 10ms 미만의 오버헤드만 추가된다. `rtk init -g`로 한 번 설정하면 Claude Code PreToolUse 훅이 모든 Bash 명령어를 자동으로 `rtk` 경유로 재작성한다. Claude는 이 리라이트를 인식하지 못하고 압축된 결과만 받는다.\n\n' +
      '네 가지 전략을 명령어 타입별로 조합해 적용한다: 노이즈 제거(스마트 필터링), 유사 항목 묶기(그루핑), 관련 컨텍스트만 남기기(트런케이션), 반복 로그 줄 집계(중복 제거). 명령어 실패 시에는 원본 전체 출력을 tee 파일로 저장해 재실행 없이 LLM이 읽을 수 있게 한다.\n\n' +
      '주의: Claude Code 내장 도구(Read, Grep, Glob)는 Bash 훅을 거치지 않아 자동 리라이트가 적용되지 않는다. 이 경우 `rtk read`, `rtk grep`, `rtk find`를 직접 호출하거나 셸 명령어(`cat`, `rg`)를 사용한다.',
    tags: ['cli', 'token-optimization', 'rust', 'claude-code'],
    requirements: [
      'macOS / Linux / Windows',
      'Claude Code, Cursor, Gemini CLI, Codex, Windsurf, Cline 등 10개 AI 도구 지원',
      'Homebrew (macOS 권장) 또는 curl 설치 스크립트',
    ],
    installSteps: [
      'brew install rtk',
      'rtk init -g',
      '# Claude Code 재시작 후 자동 적용',
      'rtk gain  # 토큰 절약량 확인',
    ],
    hookSection: {
      description:
        '`rtk init -g` 한 번으로 Claude Code 전역 설정(`~/.claude/settings.json`)에 PreToolUse 훅이 등록된다. 이후 Claude가 Bash 도구를 호출할 때마다 훅이 명령어를 가로채 `rtk <명령어>`로 투명하게 재작성한다. Claude는 이 리라이트를 인식하지 못하고 압축된 출력만 받는다.\n\n훅은 현재 세션뿐 아니라 서브에이전트를 포함한 모든 대화에 적용된다. 100% rtk 채택률을 토큰 오버헤드 없이 달성할 수 있다.',
      flow: [
        'Claude가 Bash 도구로 `git status` 호출',
        'PreToolUse 훅이 명령어를 가로채 `rtk git status`로 재작성',
        'rtk가 git을 실행하고 출력을 필터링·압축',
        'Claude는 압축된 결과(~200 토큰)만 수신 — 원본(~2,000 토큰) 미노출',
      ],
      rewriteTable: [
        { raw: 'git status / diff / log / add / commit / push / pull', rewritten: 'rtk git ...' },
        { raw: 'gh pr / issue / run', rewritten: 'rtk gh ...' },
        { raw: 'cargo test / build / clippy', rewritten: 'rtk cargo ...' },
        { raw: 'cat / head / tail <file>', rewritten: 'rtk read <file>' },
        { raw: 'rg / grep <pattern>', rewritten: 'rtk grep <pattern>' },
        { raw: 'ls', rewritten: 'rtk ls' },
        { raw: 'tsc', rewritten: 'rtk tsc' },
        { raw: 'eslint / biome', rewritten: 'rtk lint' },
        { raw: 'pytest', rewritten: 'rtk pytest' },
        { raw: 'go test / build', rewritten: 'rtk go ...' },
        { raw: 'docker ps / images / logs', rewritten: 'rtk docker ...' },
        { raw: 'kubectl get / logs', rewritten: 'rtk kubectl ...' },
        { raw: 'aws sts / ec2 / lambda / ...', rewritten: 'rtk aws ...' },
        { raw: 'curl', rewritten: 'rtk curl' },
      ],
      note: '훅은 Bash 도구 호출에만 적용된다. Claude Code 내장 Read·Grep·Glob은 훅을 거치지 않으므로 RTK 필터링이 필요하면 `rtk read`, `rtk grep`, `rtk find`를 직접 호출하거나 셸 명령어(cat, rg)를 사용한다.',
    },
    savingsTable: [
      { operation: 'ls / tree', frequency: '10x', standard: '2,000', rtk: '400', savings: '-80%' },
      { operation: 'cat / read', frequency: '20x', standard: '40,000', rtk: '12,000', savings: '-70%' },
      { operation: 'grep / rg', frequency: '8x', standard: '16,000', rtk: '3,200', savings: '-80%' },
      { operation: 'git status', frequency: '10x', standard: '3,000', rtk: '600', savings: '-80%' },
      { operation: 'git diff', frequency: '5x', standard: '10,000', rtk: '2,500', savings: '-75%' },
      { operation: 'git log', frequency: '5x', standard: '2,500', rtk: '500', savings: '-80%' },
      { operation: 'git add/commit/push', frequency: '8x', standard: '1,600', rtk: '120', savings: '-92%' },
      { operation: 'cargo test / npm test', frequency: '5x', standard: '25,000', rtk: '2,500', savings: '-90%' },
      { operation: 'pytest', frequency: '4x', standard: '8,000', rtk: '800', savings: '-90%' },
      { operation: 'go test', frequency: '3x', standard: '6,000', rtk: '600', savings: '-90%' },
      { operation: 'docker ps', frequency: '3x', standard: '900', rtk: '180', savings: '-80%' },
    ],
    commandGroups: [
      {
        category: '파일',
        commands: [
          {
            name: 'rtk ls',
            description: '디렉토리 구조를 토큰 최적화된 트리 형태로 출력한다. 불필요한 메타데이터를 제거하고 파일을 디렉토리별로 그루핑한다.',
            examples: ['rtk ls .', 'rtk ls src/'],
          },
          {
            name: 'rtk read',
            description: '파일을 스마트하게 읽는다. `-l aggressive` 옵션으로 함수 시그니처만 추출해 본문을 제거할 수 있다.',
            examples: ['rtk read file.rs', 'rtk read file.rs -l aggressive', 'rtk smart file.rs'],
            note: '`rtk smart`는 2줄 휴리스틱 요약을 출력한다.',
          },
          {
            name: 'rtk grep',
            description: '검색 결과를 파일·디렉토리별로 그루핑해 출력한다. 반복되는 경로 접두사를 제거한다.',
            examples: ['rtk grep "pattern" .', 'rtk find "*.rs" .'],
          },
          {
            name: 'rtk diff',
            description: '두 파일의 diff를 압축해 핵심 변경사항만 보여준다.',
            examples: ['rtk diff file1 file2'],
          },
        ],
      },
      {
        category: 'Git',
        commands: [
          {
            name: 'rtk git status',
            description: '변경된 파일 목록을 간결하게 출력한다. 장황한 힌트 메시지를 제거한다.',
            examples: ['rtk git status'],
          },
          {
            name: 'rtk git diff',
            description: 'diff를 압축해 변경사항의 핵심만 남긴다.',
            examples: ['rtk git diff', 'rtk git diff --staged'],
          },
          {
            name: 'rtk git log',
            description: '커밋 로그를 한 줄씩 간결하게 출력한다.',
            examples: ['rtk git log -n 10'],
          },
          {
            name: 'rtk git add / commit / push / pull',
            description: '결과를 한 줄 응답으로 압축한다. add는 `ok`, commit은 `ok abc1234`, push는 `ok main`, pull은 `ok 3 files +10 -2`.',
            examples: [
              'rtk git add .',
              'rtk git commit -m "msg"',
              'rtk git push',
              'rtk git pull',
            ],
          },
        ],
      },
      {
        category: 'GitHub CLI',
        commands: [
          {
            name: 'rtk gh',
            description: 'gh CLI 출력을 압축한다. PR·이슈·워크플로우 목록을 간결하게 표시한다.',
            examples: [
              'rtk gh pr list',
              'rtk gh pr view 42',
              'rtk gh issue list',
              'rtk gh run list',
            ],
          },
        ],
      },
      {
        category: '테스트',
        commands: [
          {
            name: 'rtk test / rtk cargo test',
            description: '실패한 테스트만 출력한다. 성공 케이스와 진행 상황 줄을 제거해 90% 절약한다.',
            examples: [
              'rtk test cargo test',
              'rtk cargo test',
              'rtk pytest',
              'rtk go test',
              'rtk vitest run',
              'rtk playwright test',
              'rtk rspec',
              'rtk rake test',
            ],
            note: '`rtk err <명령어>` 형식으로 모든 명령어 출력에서 오류·경고만 추출할 수 있다.',
          },
        ],
      },
      {
        category: '빌드 & 린트',
        commands: [
          {
            name: 'rtk tsc',
            description: 'TypeScript 타입 에러를 파일별로 그루핑해 출력한다.',
            examples: ['rtk tsc'],
          },
          {
            name: 'rtk lint',
            description: 'ESLint·Biome 결과를 룰·파일별로 그루핑한다.',
            examples: ['rtk lint', 'rtk lint biome'],
          },
          {
            name: 'rtk cargo build / clippy',
            description: 'Cargo 빌드·Clippy 출력을 80% 압축한다.',
            examples: ['rtk cargo build', 'rtk cargo clippy'],
          },
          {
            name: 'rtk ruff / rtk golangci-lint / rtk rubocop',
            description: '각 언어별 린터를 JSON 모드로 실행해 결과를 압축한다.',
            examples: ['rtk ruff check', 'rtk golangci-lint run', 'rtk rubocop'],
          },
        ],
      },
      {
        category: '컨테이너',
        commands: [
          {
            name: 'rtk docker / rtk kubectl',
            description: 'docker ps, images, logs와 kubectl pods, services, logs를 압축 출력한다. 로그는 반복 줄을 집계한다.',
            examples: [
              'rtk docker ps',
              'rtk docker images',
              'rtk docker logs <container>',
              'rtk kubectl pods',
              'rtk kubectl logs <pod>',
            ],
          },
        ],
      },
      {
        category: 'AWS',
        commands: [
          {
            name: 'rtk aws',
            description: 'AWS CLI 출력을 압축한다. 시크릿을 자동으로 마스킹하고, CloudFormation 이벤트는 실패를 우선 표시한다.',
            examples: [
              'rtk aws sts get-caller-identity',
              'rtk aws ec2 describe-instances',
              'rtk aws lambda list-functions',
              'rtk aws logs get-log-events',
              'rtk aws cloudformation describe-stack-events',
            ],
          },
        ],
      },
      {
        category: '토큰 절약 분석',
        commands: [
          {
            name: 'rtk gain',
            description: '절약된 토큰 통계를 보여준다. 그래프·히스토리·일별 분석을 지원하며 JSON 내보내기도 가능하다.',
            examples: [
              'rtk gain',
              'rtk gain --graph',
              'rtk gain --history',
              'rtk gain --daily',
              'rtk gain --all --format json',
            ],
          },
          {
            name: 'rtk discover',
            description: 'Claude Code 히스토리를 분석해 RTK를 적용하지 않아 낭비된 토큰 기회를 찾아준다.',
            examples: ['rtk discover', 'rtk discover --all --since 7'],
          },
          {
            name: 'rtk session',
            description: '최근 세션에서 RTK 적용률을 보여준다.',
            examples: ['rtk session'],
          },
        ],
      },
      {
        category: '훅 설정',
        commands: [
          {
            name: 'rtk init',
            description: 'AI 도구별 훅을 설치한다. Claude Code가 기본값이며, 10개 AI 도구를 지원한다.',
            examples: [
              'rtk init -g                  # Claude Code (기본)',
              'rtk init -g --gemini         # Gemini CLI',
              'rtk init -g --codex          # Codex (OpenAI)',
              'rtk init -g --copilot        # GitHub Copilot',
              'rtk init -g --agent cursor   # Cursor',
              'rtk init --agent windsurf    # Windsurf',
              'rtk init --agent cline       # Cline / Roo Code',
              'rtk init --show              # 설치 확인',
              'rtk init -g --uninstall      # 제거',
            ],
            note: '훅 설치 후 AI 도구를 재시작해야 적용된다. 훅은 Bash 도구 호출에만 적용되며, Claude Code 내장 Read·Grep·Glob은 대상이 아니다.',
          },
        ],
      },
    ],
    githubUrl: 'https://github.com/rtk-ai/rtk',
  },
]
