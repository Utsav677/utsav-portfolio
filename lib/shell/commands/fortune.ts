import { A } from '../ansi';
import { CommandResult, ShellState } from '../types';

const FORTUNES = [
  'The best code is no code at all. The second best is code you understand.',
  'A distributed system is one in which the failure of a computer you didn\'t even know existed can render your own computer unusable. — Leslie Lamport',
  'It works on my machine. — Famous last words.',
  'The real question is: when you build a wall, what are you keeping in? — Utsav, 2am debugging session',
  'sleep(8) is not a performance optimization.',
  'There are only two hard things in CS: cache invalidation, naming things, and off-by-one errors.',
  'Premature optimization is the root of all evil. Premature sleep is the root of all bugs.',
  'In God we trust. All others must bring data. — W. Edwards Deming',
  'The most dangerous phrase in engineering: "We\'ve always done it this way."',
  'Move fast and break things. Then fix the things. Then move fast again. — Every startup ever',
  'LLMs are like interns: confident, fast, and occasionally catastrophically wrong.',
  'RAG without evals is just vibes.',
  'The cloud is just someone else\'s computer that you\'re definitely not overusing.',
  '"It\'s not a bug, it\'s an undocumented feature." — Me, before my first code review',
  'git blame reveals the truth. git blame -w reveals the even more uncomfortable truth.',
  'The best way to get a feature request approved is to already have it implemented.',
  'A/B testing is just scientific method for people who are afraid of philosophy.',
  'If you haven\'t broken prod at least once, you\'re not shipping fast enough.',
  'The first 90% of the code accounts for the first 90% of the development time. The remaining 10% takes the other 90%.',
  'Utsav\'s Law: Any sufficiently complicated ML model is indistinguishable from overfitting.',
];

export function fortune(_args: string[], _state: ShellState): CommandResult {
  const quote = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
  const width = 56;
  const border = A.amber('-'.repeat(width));

  return [
    border,
    '',
    wrapText(quote, width - 4).map(l => '  ' + l).join('\r\n'),
    '',
    A.dimmer('  — fortune'),
    border,
  ].join('\r\n');
}

function wrapText(text: string, maxLen: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if (current.length + word.length + 1 <= maxLen) {
      current = current ? current + ' ' + word : word;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}
