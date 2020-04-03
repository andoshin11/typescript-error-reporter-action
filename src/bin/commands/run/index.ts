import * as ts from 'typescript'
import { Doctor } from '../../../doctor'
import runDiagnostics from './runDiagnostics'
import autoFix from './autoFix'

const main = async (doctor: Doctor, diagnostics: ts.Diagnostic[]) => {
  if (!diagnostics.length) return
  const autoCodeFixes = doctor.getAutoCodeFixes(diagnostics)
  const hasFixableErrors = !!autoCodeFixes.length // TODO: check manually fixble errors here
  if (!hasFixableErrors) return

  // 2. Fix auto fixable errors
  if (!!autoCodeFixes.length) {
    await autoFix(doctor, autoCodeFixes)
  }

  // 3. Handle manually fixable errors

}

export const exec = async (doctor: Doctor) => {
  const { diagnostics } = runDiagnostics(doctor, true /* initial */)
  await main(doctor, diagnostics)

  // TODO:
  // 4. Re-run diagnostics
  // const res = runDiagnostics(doctor)
  // await main(doctor, res.diagnostics)
}
