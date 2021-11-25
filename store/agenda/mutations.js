export default {
  RESET_STATE: (state) => {
    state.data = []
  },
  ADD: (state, el) => {
    state.data.push(el)
  },
  EDIT: (state, { id, property, value }) => {
    state.data[id][property] = value
  },
}
