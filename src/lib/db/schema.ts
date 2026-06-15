import { relations, sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  role: text('role').notNull().default('user'),
  banned: integer('banned', { mode: 'boolean' }).notNull().default(false),
  banReason: text('banReason'),
  banExpires: integer('banExpires', { mode: 'timestamp_ms' }),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp_ms' }).notNull(),
})

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expiresAt', { mode: 'timestamp_ms' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp_ms' }).notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  impersonatedBy: text('impersonatedBy'),
})

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: integer('accessTokenExpiresAt', { mode: 'timestamp_ms' }),
  refreshTokenExpiresAt: integer('refreshTokenExpiresAt', { mode: 'timestamp_ms' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp_ms' }).notNull(),
})

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expiresAt', { mode: 'timestamp_ms' }).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp_ms' }).notNull(),
})

export const profiles = sqliteTable(
  'profiles',
  {
    user_id: text('user_id')
      .primaryKey()
      .references(() => user.id, { onDelete: 'cascade' }),
    username: text('username').notNull(),
    display_name: text('display_name'),
    avatar_url: text('avatar_url'),
    avatar_key: text('avatar_key'),
    bio: text('bio'),
    accent: text('accent').notNull().default('#a78bfa'),
    theme: text('theme', { enum: ['dark', 'light'] }).notNull().default('dark'),
    published: integer('published', { mode: 'boolean' }).notNull().default(false),
    subscription_status: text('subscription_status', {
      enum: ['active', 'canceled', 'past_due', 'revoked'],
    }),
    subscription_id: text('subscription_id'),
    polar_customer_id: text('polar_customer_id'),
    subscription_current_period_end: integer('subscription_current_period_end', {
      mode: 'timestamp_ms',
    }),
    created_at: text('created_at')
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
    updated_at: text('updated_at')
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
      .$onUpdate(() => new Date().toISOString()),
  },
  (t) => [uniqueIndex('profiles_username_uniq').on(sql`lower(${t.username})`)],
)

export const tabs = sqliteTable(
  'tabs',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    user_id: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    label: text('label').notNull(),
    type: text('type', { enum: ['grid', 'video'] })
      .notNull()
      .default('grid'),
    grid_size: text('grid_size', { enum: ['small', 'medium', 'large'] })
      .notNull()
      .default('medium'),
    position: integer('position').notNull().default(0),
    created_at: text('created_at')
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
    updated_at: text('updated_at')
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
      .$onUpdate(() => new Date().toISOString()),
  },
  (t) => [index('tabs_user_position_idx').on(t.user_id, t.position)],
)

export const media = sqliteTable(
  'media',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tab_id: text('tab_id')
      .notNull()
      .references(() => tabs.id, { onDelete: 'cascade' }),
    kind: text('kind', { enum: ['image', 'video'] })
      .notNull()
      .default('image'),
    r2_key: text('r2_key').notNull(),
    url: text('url').notNull(),
    width: integer('width'),
    height: integer('height'),
    poster_key: text('poster_key'),
    poster_url: text('poster_url'),
    position: integer('position').notNull().default(0),
    created_at: text('created_at')
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  },
  (t) => [index('media_tab_position_idx').on(t.tab_id, t.position)],
)

export const links = sqliteTable(
  'links',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    user_id: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    tab_id: text('tab_id').references(() => tabs.id, { onDelete: 'cascade' }),
    network: text('network'),
    handle: text('handle'),
    title: text('title').notNull(),
    url: text('url').notNull(),
    icon: text('icon'),
    icon_url: text('icon_url'),
    position: integer('position').notNull().default(0),
    created_at: text('created_at')
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
    updated_at: text('updated_at')
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
      .$onUpdate(() => new Date().toISOString()),
  },
  (t) => [index('links_user_position_idx').on(t.user_id, t.position)],
)

export const ig_connections = sqliteTable('ig_connections', {
  user_id: text('user_id')
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  ig_user_id: text('ig_user_id').notNull(),
  username: text('username'),
  access_token: text('access_token').notNull(),
  token_expires_at: integer('token_expires_at', { mode: 'timestamp_ms' }),
  created_at: text('created_at')
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  updated_at: text('updated_at')
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
    .$onUpdate(() => new Date().toISOString()),
})

export const import_jobs = sqliteTable('import_jobs', {
  id: text('id').primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  tab_id: text('tab_id')
    .notNull()
    .references(() => tabs.id, { onDelete: 'cascade' }),
  source: text('source', { enum: ['instagram'] }).notNull(),
  status: text('status', { enum: ['pending', 'running', 'processing', 'done', 'failed'] })
    .notNull()
    .default('pending'),
  pending_items: text('pending_items'),
  total: integer('total').notNull().default(0),
  imported: integer('imported').notNull().default(0),
  error: text('error'),
  created_at: text('created_at')
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  updated_at: text('updated_at')
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
    .$onUpdate(() => new Date().toISOString()),
})

export const userRelations = relations(user, ({ one }) => ({
  profile: one(profiles, { fields: [user.id], references: [profiles.user_id] }),
}))

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(user, { fields: [profiles.user_id], references: [user.id] }),
  tabs: many(tabs),
  links: many(links),
}))

export const tabsRelations = relations(tabs, ({ one, many }) => ({
  profile: one(profiles, { fields: [tabs.user_id], references: [profiles.user_id] }),
  media: many(media),
  links: many(links),
}))

export const mediaRelations = relations(media, ({ one }) => ({
  tab: one(tabs, { fields: [media.tab_id], references: [tabs.id] }),
}))

export const linksRelations = relations(links, ({ one }) => ({
  profile: one(profiles, { fields: [links.user_id], references: [profiles.user_id] }),
  tab: one(tabs, { fields: [links.tab_id], references: [tabs.id] }),
}))
