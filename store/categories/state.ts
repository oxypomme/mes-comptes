import type { Category } from '~/types'

const state = () => ({
  data: [] as Category[],
})

export default state

export type CategoryState = ReturnType<typeof state>
