interface TextSpan {
  start: number;
  length: number;
}

export interface TextChange {
  span: TextSpan;
  newText: string;
}

type CodeFixActionBase = {
  fileName: string;
  /** Short name to identify the fix, for use by telemetry. */
  fixName: string;
  /** Description of the code action to display */
  description: string;
}

type FileTextChange = CodeFixActionBase & {
  textChange: TextChange
}

export type CodeFixAction = FileTextChange
