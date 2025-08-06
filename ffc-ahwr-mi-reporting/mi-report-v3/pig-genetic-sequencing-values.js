// Should ideally be imported from common library but not able to import
// as this repo is commonJS not ESM
const PIG_GENETIC_SEQUENCING_VALUES = [
  {
    value: 'mlv',
    label: 'Modified Live virus (MLV) only'
  },
  {
    value: 'prrs1',
    label: 'Wild Type (WT) PRRS 1 only'
  },
  {
    value: 'prrs1Plus',
    label: '(WT) PRRS 1 plus MLV or recombination'
  },
  {
    value: 'recomb',
    label: 'Recombination only'
  },
  {
    value: 'prrs2',
    label: 'Any PRRS 2 (reportable by the laboratory)'
  }
]

module.exports = { PIG_GENETIC_SEQUENCING_VALUES }
