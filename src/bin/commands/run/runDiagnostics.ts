import { Spinner } from 'clui'
import { Doctor } from '../../../doctor'
import { fileNumWithUnit } from './helper'

const runDiagnostics = (doctor: Doctor, initial: boolean = false) => {
  // Prepare
  const spinnerMsg = initial ? `Running diagnostics on ${fileNumWithUnit(doctor.fileNames)}...` : `Checking diagnostics on ${fileNumWithUnit(doctor.fileNames)}...`
  const spinner = new Spinner(spinnerMsg)
  spinner.start()

  try {
    // Main
    const diagnostics = doctor.getSemanticDiagnostics()
    if (initial) {
      doctor.reporter.reportDiagnostics(diagnostics)
    }
    doctor.reporter.reportDiagnosticsSummary(diagnostics)

    return {
      diagnostics
    }
  } catch (e) {
    throw e
  } finally {
    // Close
    spinner.stop()
  }

}

export default runDiagnostics
