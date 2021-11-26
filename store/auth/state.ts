import type { User } from '~/types'

const state = () => ({
  user: null as User | null,
})

export default state

export type AuthState = ReturnType<typeof state>
