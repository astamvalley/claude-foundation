export interface Source {
  label: string
  url: string
}

export interface Skill {
  name: string
  description: string
  longDescription: string
  tags: string[]
  sources?: Source[]
}

export const REPO = 'astamvalley/claude-foundation'
export const GITHUB_BASE = `https://github.com/${REPO}`
export const RAW_BASE = `https://raw.githubusercontent.com/${REPO}/main`

export const skills: Skill[] = [
  {
    name: 'create-skill',
    description: 'agentskills.io 스펙 기반 스킬 제작 가이드. 스킬을 만들거나 워크플로우를 패키징하고 싶을 때 사용.',
    longDescription:
      'agentskills.io 스펙을 따르는 새 Agent Skill(SKILL.md + 지원 파일)을 제작한다.\n' +
      'Claude Code, Cursor, VS Code Copilot, Gemini CLI 등 30개 이상의 도구에서 바로 사용 가능한\n' +
      '고품질 스킬을 6단계 워크플로우로 안내한다.',
    tags: ['meta', 'tooling'],
    sources: [
      { label: 'agentskills.io — 공식 포맷 스펙', url: 'https://agentskills.io/specification' },
      { label: 'agentskills.io — Best Practices', url: 'https://agentskills.io/skill-creation/best-practices' },
      { label: 'agentskills.io — Description 최적화', url: 'https://agentskills.io/skill-creation/optimizing-descriptions' },
      { label: 'agentskills.io — Scripts 사용법', url: 'https://agentskills.io/skill-creation/using-scripts' },
      { label: 'skills.sh — Vercel Labs 배포 사례', url: 'https://skills.sh/vercel-labs/agent-skills' },
    ],
  },
  {
    name: 'auto-commit',
    description: '커밋 컨벤션 기반 커밋 자동화. 변경 사항을 분석해 작업별로 커밋을 나누고 사용자 확인 후 실행한다.',
    longDescription:
      '변경된 코드를 분석해 커밋 컨벤션(feat/fix/refactor 등)에 맞는 메시지를 자동 생성한다.\n' +
      '작업별 커밋 그룹핑, 위험 파일 감지, 브랜치명 자동 삽입, 단계별 확인 위자드를 포함한다.\n' +
      'Task 목록을 참고해 Why(변경 동기)와 What(특이 함수 명시)을 body에 자동으로 채운다.',
    tags: ['git', 'commit', 'automation'],
    sources: [
      { label: '커밋 컨벤션 가이드', url: 'https://velog.io/@ninto_2/%EC%BB%A4%EB%B0%8B-%EC%BB%A8%EB%B2%A4%EC%85%98' },
      { label: 'Conventional Commits 공식 스펙', url: 'https://www.conventionalcommits.org/en/v1.0.0/' },
      { label: 'Git commit message best practices', url: 'https://cbea.ms/git-commit/' },
    ],
  },
  {
    name: 'configure-notifications',
    description: 'Claude Code 알림 설정/제거 위자드. macOS 시스템 알림과 Slack 웹훅을 대화형으로 설정한다.',
    longDescription:
      'Claude가 작업을 완료하거나 입력 대기 시 알림을 받도록 설정한다.\n' +
      '현재 설정 상태를 확인하고 macOS 시스템 알림 또는 Slack 웹훅을 설정/제거할 수 있다.\n' +
      '이미 설정된 항목은 ✓ 표시로 구분되며, 선택 시 제거 옵션을 제공한다.',
    tags: ['notification', 'setup'],
  },
]
