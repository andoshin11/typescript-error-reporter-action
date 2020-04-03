export type Symptom = {
  type: 'autoFixable' | 'unFixable' | 'treatable'
  location?: SymptomLocation
}

export enum SymptomLocation {
  ARGUMENT = 1,
}
