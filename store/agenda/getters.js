export default {
  getAgenda: (state) => state.data,
  getMonth:
    (state, getters) =>
    (
      month // in range 1-12
    ) =>
      getters.getAgenda
        .map((l) => [l.values[month - 1], l.modifier])
        .reduce((sum, v) => sum + (v[0] || 0) * (v[1] || -1), 0),
}
