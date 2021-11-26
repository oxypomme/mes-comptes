import { AgendaRow } from '~/types'

const state = () => ({
  data: [] as AgendaRow[],
})

export default state

export type AgendaState = ReturnType<typeof state>
