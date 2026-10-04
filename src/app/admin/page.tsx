import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { profiles, user } from '@/lib/db/schema'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DisplayTitle } from '@/components/ui/DisplayTitle'
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
      <div className="flex flex-col items-start gap-4">
        <Badge>{rows.length} total</Badge>
        <DisplayTitle lead="Users" size="md" />
      </div>

      <Card padded={false} className="overflow-hidden">
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
      </Card>
    </div>
  )
}
