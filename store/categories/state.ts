import type { Category } from '~/types'

/**
 * State for user's categories
 *
 * @returns The state
 */
const state = () => ({
  /**
   * List of categories of the authed user in the selected account
   */
  data: [] as Category[],
})

export default state

export type CategoryState = ReturnType<typeof state>
