import * as chalk from 'chalk'

export const pad = (letter: string, length: number) => {
  const outs: string[] = [];
  for (let i = 0; i < length; i++) {
    outs.push(letter);
  }
  return outs.join('');
}

export const lineMark = (line: number, width: number) => {
  const strLine = line + 1 + '';
  return chalk.inverse(pad(' ', width - strLine.length) + strLine) + ' '
};

export const lineMarkForUnderline = (width: number) => {
  return chalk.inverse(pad(' ', width)) + ' ';
};
