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
  /**
   * Number per page
   */
  items: 15,
  /**
   * Current page in state
   */
  page: 1,
  /**
   * Keep in state every page's limit
   */
  anchors: {
    firsts: {} as { [page: string]: Operation },
    lasts: {} as { [page: string]: Operation },
  },
})

export default state

export type OperationState = ReturnType<typeof state>
