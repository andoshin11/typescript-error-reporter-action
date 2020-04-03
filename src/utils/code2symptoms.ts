import { code2symptomDict } from '../const'
import { Symptom } from '../types'

/**
 * Convert TS diagnostic code to inner symptoms type
 */

export const code2symptom = (code: number): Symptom => {
  const result = code2symptomDict[code]

  return !!result ? result : { type: 'unFixable' }
}
