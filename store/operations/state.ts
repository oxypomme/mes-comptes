import type { Operation } from '~/types'

const state = () => ({
  data: [] as Operation[],
})

export default state

export type OperationState = ReturnType<typeof state>
