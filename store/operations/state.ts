import type { Operation } from '~/ts/types'

/**
 * State for user's operations
 *
 * @returns The state
 */
const state = () => ({
  /**
   * The operations for the auther user in the selected account
   */
  data: [] as Operation[],
  loading: false,
})

export default state

export type OperationState = ReturnType<typeof state>
