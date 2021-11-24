export default {
  getAgenda: (state) =>
    state.data || [
      {
        name: 'Mock 1',
        category: 'Mock',
        modifier: -1,
        values: [
          257.7, 255.7, 259.7, 257.7, 257.7, 257.7, 257.7, 257.7, 257.7, 257.7,
          157.7, 257.7,
        ],
      },
      {
        name: 'Mock 2',
        category: 'Mock',
        modifier: 1,
        values: [
          257.7, 257.7, 257.7, 257.7, 257.7, 257.7, 257.7, 257.7, 257.7, 257.7,
          57.7, 257.7,
        ],
      },
    ],
  getMonth:
    (state, getters) =>
    (
      month // in range 1-12
    ) =>
      getters.getAgenda
        .map((l) => [l.values[month - 1], l.modifier])
        .reduce((sum, v) => sum + (v[0] || 0) * (v[1] || -1), 0),
}
