import { skills, REPO } from '@/lib/skills'
import { externalSkills } from '@/lib/external-skills'
import CopyButton from '@/components/CopyButton'
import TabNav from '@/components/TabNav'
import FilteredList, { ListItem } from '@/components/FilteredList'

export default function Home() {
  const installAll = `npx skills add ${REPO}`

  const items: ListItem[] = [
    ...skills.map((s) => ({
      name: s.name,
      description: s.description,
      tags: s.tags,
      source: 'my',
      href: `/skills/${s.name}`,
    })),
    ...externalSkills.map((s) => ({
      name: s.name,
      description: s.description,
      tags: s.tags,
      source: 'external',
      author: s.author,
      href: `/external/${s.name}`,
    })),
  ]

  return (
    <>
      <TabNav />

      <div className="mb-8">
        <div className="flex items-baseline justify-between mb-2">
          <p className="text-[11px] text-zinc-600 uppercase tracking-widest">My Skills 전체 설치</p>
          <p className="text-[10px] font-mono text-zinc-700">external은 각 상세 페이지에서 설치</p>
        </div>
        <div className="flex items-center gap-3 border border-zinc-800 rounded px-4 py-3 bg-zinc-900/50">
          <code className="font-mono text-sm text-orange-300/90 flex-1 overflow-x-auto whitespace-nowrap">
            {installAll}
          </code>
          <CopyButton text={installAll} />
        </div>
      </div>

      <section>
        <FilteredList items={items} />
      </section>
    </>
  )
}
