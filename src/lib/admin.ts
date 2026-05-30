export function isAdminUser(user: { id: string; role?: string | null }): boolean {
  if (process.env.ADMIN_USER_ID && user.id === process.env.ADMIN_USER_ID) return true
  return user.role === 'admin'
}
