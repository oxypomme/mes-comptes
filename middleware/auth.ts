import type { Middleware } from '@nuxt/types'

const middleware: Middleware = ({ store, redirect }) => {
  // Check if connected
  if (!store.getters['auth/getUser']) {
    return redirect('/login')
  }
}

export default middleware
