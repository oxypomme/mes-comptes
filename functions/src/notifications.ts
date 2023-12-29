export const buildMonthReset = () => ({
  title: '\uD83D\uDCC5 Nouveau jour, nouveau mois...',
  body: 'Vos budgets ont été remis à zéro. Profitez en pour vous faire plaisir !',
})

export const buildNewOperation = (name: string, amount: number) => ({
  title: '\uD83D\uDCC5 Une nouvelle opération vous attend !',
  body: `L'opération "${name}" avec une valeur de ${amount.toLocaleString(
    undefined,
    {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
      style: 'currency',
      currency: 'EUR',
    }
  )} a été automatiquement ajoutée.`,
})
