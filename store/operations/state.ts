import type firebase from 'firebase'
import type { Operation } from '~/types'

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
   * First fetched document
   */
  firstdoc: undefined as any | firebase.firestore.DocumentSnapshot | undefined,
  /**
   * Last fetched document
   */
  lastdoc: undefined as any | firebase.firestore.DocumentSnapshot | undefined,
  /**
   * Number per page
   */
  items: 5,
})

export default state

export type OperationState = ReturnType<typeof state>
