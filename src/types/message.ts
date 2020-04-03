type CommandType = 'error' | 'warning'

export type Message = {
  command: CommandType;
  properties: {
    file?: string;
    line?: string;
    col?: string;
  };
  message: string
}
