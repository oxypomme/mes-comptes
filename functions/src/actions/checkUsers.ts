import { store } from '../firebase'
import resetCategoriesBalance from './resetCategoriesBalance'

/**
 * Check every user if an action is needed
 */
export default async () => {
  const d = new Date()
  const users = await store().collection('users').listDocuments()

  return Promise.all([
    ...users.map(async (ref) => {
      await resetCategoriesBalance(ref, d)
    }),
  ])
}
