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
]
