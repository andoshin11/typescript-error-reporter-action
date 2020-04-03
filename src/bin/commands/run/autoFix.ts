import { prompt } from 'enquirer'
import { Doctor } from '../../../doctor'
import { CodeFixAction } from '../../../types'

const autoFix = async (doctor: Doctor, autoCodeFixes: CodeFixAction[]) => {
  if (!autoCodeFixes.length) return false

  const { confirm } = await prompt<{ confirm: boolean }>({
    type: 'confirm',
    name: 'confirm',
    message: `Fix auto fixable errors? (found ${autoCodeFixes.length} items)`,
  })

  if (confirm) {
    doctor.applyAutoCodeFixActions()
  }

  return confirm
}

export default autoFix
