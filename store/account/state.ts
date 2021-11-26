import type { Account } from '~/types'

const state = () => ({
  accounts: [] as Account[],
  current: null as Account | null,
})

export default state

export type AccountState = ReturnType<typeof state>
