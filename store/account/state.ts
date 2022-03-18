import type { Account } from '~/ts/types'

/**
 * State for user's accounts
 *
 * @returns The state
 */
const state = () => ({
  /**
   * List of user's accounts
   */
  accounts: [] as Account[],
  /**
   * Selected user's account
   */
  current: null as Account | null,
  loading: false,
})

export default state

export type AccountState = ReturnType<typeof state>
