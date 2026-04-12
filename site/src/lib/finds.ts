export interface Find {
  name: string
  url: string
  author: string
  description: string
  tags: string[]
}

export const finds: Find[] = [
  {
    name: 'k-skill',
    url: 'https://github.com/NomaDamas/k-skill',
    author: 'NomaDamas',
    description: '한국 서비스 특화 스킬 모음. SRT, KTX, KBO, 카카오톡, 미세먼지, 부동산 검색 등 30+ 스킬.',
    tags: ['korean', 'collection'],
  },
]
