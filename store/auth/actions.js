export default {
  onAuth({ commit, dispatch }, { authUser }) {
    if (authUser) {
      commit('SET_AUTH_USER', authUser)
      return dispatch('account/bindAccounts', authUser, { root: true })
    } else {
      commit('RESET_STATE')
      return dispatch('account/unbindAccounts', null, { root: true })
    }
  },
  async createUser({ dispatch }, { email, password, balance }) {
    const { user } = await this.$fire.auth.createUserWithEmailAndPassword(
      email,
      password
    )

    const date = new Date()

    const ref = this.$fire.firestore.collection('users').doc(user.uid)
    await ref.set({
      resetDate: this.$fireModule.firestore.Timestamp.fromDate(
        new Date(date.getFullYear(), date.getMonth(), 1)
      ),
    })
    return dispatch(
      'account/createAccount',
      {
        name: 'Courant',
        balance,
      },
      { root: true }
    )
  },
  loginUser(ctx, { email, password }) {
    return this.$fire.auth.signInWithEmailAndPassword(email, password)
  },
  signOut() {
    return this.$fire.auth.signOut()
  },
}
