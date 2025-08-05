export const getPigGeneticSequencingValues = async () => {
  const { default: PIG_GENETIC_SEQUENCING_VALUES } = await import('./common-library-esm-wrapper.mjs')

  return PIG_GENETIC_SEQUENCING_VALUES
}
