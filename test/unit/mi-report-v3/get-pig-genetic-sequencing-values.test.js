describe('getPigGeneticSequencingValues', () => {
  test('loads ESM from CJS', async () => {
    const { default: PIG_GENETIC_SEQUENCING_VALUES } = await import(
      '../../../ffc-ahwr-mi-reporting/mi-report-v3/common-library-esm-wrapper.mjs'
    )
    expect(PIG_GENETIC_SEQUENCING_VALUES).toEqual([
      { label: 'Modified Live virus (MLV) only', value: 'mlv' },
      { label: 'Wild Type (WT) PRRS 1 only', value: 'prrs1' },
      { label: '(WT) PRRS 1 plus MLV or recombination', value: 'prrs1Plus' },
      { label: 'Recombination only', value: 'recomb' },
      { label: 'Any PRRS 2 (reportable by the laboratory)', value: 'prrs2' }
    ])
  })
})
