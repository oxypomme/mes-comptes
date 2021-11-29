import type { AgendaRow } from '~/types'

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
})

export default state

export type AgendaState = ReturnType<typeof state>
