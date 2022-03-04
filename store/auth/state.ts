import type { User } from '~/ts/types'

/**
 * State for user
 *
 * @returns The state
 */
const state = () => ({
  /**
   * Current authed user
   */
  user: null as User | null,
})

export default state

export type AuthState = ReturnType<typeof state>
