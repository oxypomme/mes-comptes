import type { User, Device } from '~/ts/types'

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
  /**
   * Current linked devices
   */
  devices: [] as Device[],
})

export default state

export type AuthState = ReturnType<typeof state>
