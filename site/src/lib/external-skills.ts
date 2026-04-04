export interface ExternalSkill {
  name: string
  repo: string // 'anthropics/skills@frontend-design'
  author: string // 'anthropics'
  description: string
  longDescription: string
  tags: string[]
  url: string // skills.sh 링크
}

export const externalSkills: ExternalSkill[] = [
  {
    name: 'frontend-design',
    repo: 'anthropics/skills@frontend-design',
    author: 'anthropics',
    description: 'Generic AI 미학을 거부하는 distinctive, production-grade 프론트엔드 인터페이스 제작 스킬.',
    longDescription:
      '"그냥 작동하는 UI"가 아닌 시각적으로 기억에 남는 인터페이스를 만드는 데 초점을 맞춘다.\n\n' +
      '구현 전 먼저 미적 방향성을 정의한다. brutalist, maximalist, retro-futuristic, luxury, playful 등 구체적인 컨셉에서 출발해 목적·톤·차별화 요소를 결정한 뒤 코드로 옮긴다.\n\n' +
      '타이포그래피, 색상 시스템, 애니메이션, 공간 구성, 텍스처를 디자인의 핵심 레버로 다루며, HTML/CSS/JS·React·Vue 등 요청에 맞는 스택으로 실제 동작하는 코드를 생성한다.\n\n' +
      '의도적으로 피하는 것들이 있다. Inter·Roboto 같은 무난한 폰트, 자주색 그래디언트, 카드+그리드+둥근 모서리로 이어지는 예측 가능한 레이아웃, 맥락 없이 붙여넣은 템플릿식 패턴. 이 스킬이 존재하는 이유는 AI가 만든 UI가 전부 비슷해 보이는 문제를 해결하기 위해서다.',
    tags: ['design', 'ui', 'frontend'],
    url: 'https://skills.sh/anthropics/skills/frontend-design',
  },
  {
    name: 'web-design-guidelines',
    repo: 'vercel-labs/agent-skills@web-design-guidelines',
    author: 'vercel-labs',
    description: 'Vercel Web Interface Guidelines에 따라 UI 코드의 디자인·접근성·UX를 감사(audit)하는 스킬.',
    longDescription:
      'Vercel Engineering이 내부적으로 사용하는 Web Interface Guidelines를 기준으로 UI 코드를 감사한다. 디자인 완성도·접근성·UX 모범 사례를 한 번에 점검할 수 있다.\n\n' +
      '검토할 때마다 GitHub 원격 소스에서 최신 가이드라인을 자동으로 내려받아 적용한다. 별도로 규칙을 업데이트할 필요 없이 항상 최신 기준으로 검사된다.\n\n' +
      '파일 경로나 글로브 패턴을 인자로 넘기면 즉시 검사가 시작된다. 결과는 "file:line" 형식으로 출력돼 어디를 고쳐야 하는지 바로 확인할 수 있다.\n\n' +
      '"UI 리뷰해줘", "접근성 체크해줘", "디자인 감사해줘" 같은 요청에 자동으로 활성화된다. 파일을 지정하지 않으면 어떤 파일을 검토할지 되묻는다.',
    tags: ['design', 'review', 'accessibility'],
    url: 'https://skills.sh/vercel-labs/agent-skills/web-design-guidelines',
  },
  {
    name: 'vercel-react-best-practices',
    repo: 'vercel-labs/agent-skills@vercel-react-best-practices',
    author: 'vercel-labs',
    description: 'React·Next.js 성능 최적화 규칙집. 8개 카테고리, 64개+ 규칙을 우선순위별로 정리.',
    longDescription:
      'Vercel이 관리하는 React·Next.js 성능 최적화 가이드. 각 규칙은 잘못된 코드와 올바른 코드 예시, 이유 설명을 함께 제공한다.\n\n' +
      '8개 카테고리를 임팩트 순으로 다룬다.\n' +
      'CRITICAL: 비동기 워터폴 제거(async-), 번들 사이즈 최적화(bundle-)\n' +
      'HIGH: 서버사이드 캐싱(server-)\n' +
      'MEDIUM: 클라이언트 데이터 페칭(client-), 리렌더 최적화(rerender-), 렌더링 성능(rendering-)\n' +
      'LOW: JS 성능(js-), 고급 패턴(advanced-)\n\n' +
      '컴포넌트 작성, 코드 리뷰, 리팩토링, 성능 감사 시 참조하도록 설계됐다. 각 규칙은 `async-parallel`, `bundle-barrel-imports` 같은 prefix 코드로 식별해 자동화 도구와 문서에서 쉽게 참조할 수 있다.',
    tags: ['react', 'nextjs', 'performance'],
    url: 'https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices',
  },
  {
    name: 'find-skills',
    repo: 'vercel-labs/skills@find-skills',
    author: 'vercel-labs',
    description: '오픈 에코시스템에서 전문화된 에이전트 스킬을 발견하고 설치를 안내하는 도우미.',
    longDescription:
      '"이런 기능 스킬 있나요?", "어떻게 X를 해야 하나요?" 같은 질문을 받으면 스킬 생태계를 먼저 탐색한다. 직접 구현하기 전에 이미 만들어진 전문 스킬이 있는지 확인하는 역할이다.\n\n' +
      '`npx skills find [query]`로 관련 스킬을 검색하고, 설치 횟수 1K+·신뢰 출처(vercel-labs, anthropics 등)·GitHub 별 100+ 기준으로 품질을 검증한다. 검증을 통과한 스킬만 추천한다.\n\n' +
      '추천 결과에는 스킬명, 설치 횟수, 설치 명령어, skills.sh 링크를 함께 제공한다. 마음에 들면 `npx skills add <owner/repo@skill> -g -y`로 바로 설치할 수 있다.\n\n' +
      '적합한 스킬이 없으면 직접 도움을 제공하거나, 필요한 경우 create-skill 스킬로 새 스킬 제작을 안내한다.',
    tags: ['meta', 'tooling', 'discovery'],
    url: 'https://skills.sh/vercel-labs/skills/find-skills',
  },
]
