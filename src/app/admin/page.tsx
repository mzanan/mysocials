import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { profiles, user } from '@/lib/db/schema'
import { UserRow } from './_components/UserRow'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const rows = await db
    .select({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      banned: user.banned,
      createdAt: user.createdAt,
      username: profiles.username,
      published: profiles.published,
      subscriptionStatus: profiles.subscription_status,
    })
    .from(user)
    .leftJoin(profiles, eq(profiles.user_id, user.id))
    .orderBy(desc(user.createdAt))
    .limit(200)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-fg-subtle">{rows.length} total</p>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-hairline bg-surface backdrop-blur-xl shadow-[var(--shadow-card)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-fg-subtle">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Page</th>
              <th className="px-4 py-3 font-medium">Subscription</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {rows.map((r) => (
              <UserRow key={r.id} user={r} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
