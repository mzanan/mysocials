import { MockProfileCard, type MockLink } from './MockProfileCard'

interface Creator {
  name: string
  handle: string
  avatar: string
  links: MockLink[]
}

const COLUMNS: Creator[][] = [
  [
    { name: 'Mara Ávalos', handle: '@maraavalos', avatar: '/people/p07.webp', links: [{ slug: 'instagram', label: '@maraavalos' }, { slug: 'youtube', label: 'YouTube' }] },
    { name: 'Leo Fields', handle: '@leofilms', avatar: '/people/p21.webp', links: [{ slug: 'tiktok', label: 'TikTok' }, { slug: 'spotify', label: 'Latest drop' }] },
    { name: 'Nina Cole', handle: '@ninacole', avatar: '/people/p33.webp', links: [{ slug: 'instagram', label: '@ninacole' }, { slug: 'twitch', label: 'Live now' }] },
  ],
  [
    { name: 'Theo Park', handle: '@theopark', avatar: '/people/p12.webp', links: [{ slug: 'youtube', label: 'Channel' }, { slug: 'github', label: 'Projects' }] },
    { name: 'Aria Sol', handle: '@ariasol', avatar: '/people/p41.webp', links: [{ slug: 'spotify', label: 'New single' }, { slug: 'instagram', label: '@ariasol' }] },
    { name: 'Dev Mehta', handle: '@devmehta', avatar: '/people/p18.webp', links: [{ slug: 'linkedin', label: 'LinkedIn' }, { slug: 'twitter', label: 'Follow' }] },
  ],
  [
    { name: 'Sofia Ren', handle: '@sofiaren', avatar: '/people/p27.webp', links: [{ slug: 'tiktok', label: 'TikTok' }, { slug: 'instagram', label: 'Photos' }] },
    { name: 'Kai Storm', handle: '@kaistorm', avatar: '/people/p45.webp', links: [{ slug: 'twitch', label: 'Stream' }, { slug: 'youtube', label: 'Clips' }] },
    { name: 'Lucia Mar', handle: '@luciamar', avatar: '/people/p03.webp', links: [{ slug: 'instagram', label: '@luciamar' }, { slug: 'spotify', label: 'Playlist' }] },
  ],
  [
    { name: 'Omar Vidal', handle: '@omarvidal', avatar: '/people/p50.webp', links: [{ slug: 'youtube', label: 'Films' }, { slug: 'instagram', label: 'Behind' }] },
    { name: 'Yui Tanaka', handle: '@yuitanaka', avatar: '/people/p36.webp', links: [{ slug: 'tiktok', label: 'Dance' }, { slug: 'spotify', label: 'Sounds' }] },
    { name: 'Bea Costa', handle: '@beacosta', avatar: '/people/p14.webp', links: [{ slug: 'instagram', label: 'Travel' }, { slug: 'youtube', label: 'Vlogs' }] },
  ],
]

export function HeroCards() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-app-bg" />
      <div
        className="absolute -left-1/4 -top-1/4 h-[70%] w-[80%] rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, color-mix(in oklab, var(--accent-glow) 70%, transparent), transparent 65%)' }}
      />
      <div
        className="absolute -right-1/4 top-1/3 h-[70%] w-[80%] rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, color-mix(in oklab, var(--accent-2) 55%, transparent), transparent 65%)' }}
      />
      <div
        className="absolute -bottom-1/4 left-1/4 h-[65%] w-[75%] rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, color-mix(in oklab, var(--accent-2) 65%, transparent), transparent 65%)' }}
      />

      <div className="absolute inset-0 flex justify-center gap-4 px-3 lg:justify-end lg:gap-5 lg:pr-12">
        {COLUMNS.map((col, i) => (
          <div
            key={i}
            className="flex w-40 shrink-0 flex-col gap-4 sm:w-48 lg:w-56"
            style={{ animation: `${i % 2 ? 'hero-drift-down' : 'hero-drift-up'} ${44 + i * 7}s linear infinite` }}
          >
            {[...col, ...col].map((c, j) => (
              <MockProfileCard
                key={j}
                name={c.name}
                handle={c.handle}
                avatar={c.avatar}
                links={c.links}
                className="w-full"
              />
            ))}
          </div>
        ))}
      </div>

      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-app-bg to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-app-bg to-transparent" />
      <div className="absolute inset-y-0 left-0 hidden w-[62%] bg-gradient-to-r from-app-bg via-app-bg/85 to-transparent lg:block" />
    </div>
  )
}
