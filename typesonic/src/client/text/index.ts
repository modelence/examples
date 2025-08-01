import { getConfig } from 'modelence/client';

export const LINE_MAX_OVERFLOW = 5; // Extra characters that the user is allowed to type over the limit for less abrupt stop

export function getLineMaxLength() {
  return Number(getConfig('typewriterText.format.maxLineLength'));
}

export function getTextLines(text: string): string[] {
  const maxLineLength = getLineMaxLength();
  const words = text.split('\n').join(' ').split(' ').map(s => s.trim()).filter(s => s !== '');
  const lines = [''];
  const getCurrentLine = () => lines[lines.length - 1];
  const getAdjustedCurrentLine = (word: string) => [getCurrentLine(), word].filter(s => s !== '').join(' ');
  words.forEach(word => {
    if (getAdjustedCurrentLine(word).length > maxLineLength) {
      lines.push('');
    }
    lines[lines.length - 1] = getAdjustedCurrentLine(word);
  });
  return lines;
}
