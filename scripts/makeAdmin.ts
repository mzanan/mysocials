import { config } from 'dotenv'
import { eq } from 'drizzle-orm'

config({ path: '.env.local' })

import { db, schema } from '../src/lib/db'

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: tsx scripts/makeAdmin.ts <email>')
    process.exit(1)
  }

  const [updated] = await db
    .update(schema.user)
    .set({ role: 'admin' })
    .where(eq(schema.user.email, email))
    .returning({ id: schema.user.id, email: schema.user.email, role: schema.user.role })

  if (!updated) {
    console.error(`No user found with email "${email}". Sign up first, then run this again.`)
    process.exit(1)
  }

  console.log(`Promoted ${updated.email} (${updated.id}) to role "${updated.role}".`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
