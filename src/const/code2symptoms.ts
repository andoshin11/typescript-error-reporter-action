import { Symptom, SymptomLocation } from '../types'

export const code2symptomDict: Record<number, Symptom> = {
  2345: {
    type: 'treatable',
    location: SymptomLocation.ARGUMENT
  }
}
