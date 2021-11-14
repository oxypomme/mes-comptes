export default {
  SET_AUTH_USER: (state, { uid, email, emailVerified }) => {
    if (uid) {
      state.user = { uid, email, emailVerified }
    } else {
      state.user = null
    }
  },
  RESET_STATE: (state) => {
    state.user = null
  },
}
