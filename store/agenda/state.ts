import type { AgendaRow } from '~/ts/types'

/**
 * The state for user's agenda
 *
 * @returns The state
 */
const state = () => ({
  /**
   * The agenda
   */
  data: [] as AgendaRow[],
  loading: false,
})

export default state

export type AgendaState = ReturnType<typeof state>
