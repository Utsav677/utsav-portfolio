import { A } from '../ansi';
import { contact } from '../../data/contact';
import { experiences } from '../../data/experience';
import { CommandResult, ShellState } from '../types';

const ASCII_ART = `
  ██╗   ██╗████████╗███████╗ █████╗ ██╗   ██╗
  ██║   ██║╚══██╔══╝██╔════╝██╔══██╗██║   ██║
  ██║   ██║   ██║   ███████╗███████║██║   ██║
  ██║   ██║   ██║   ╚════██║██╔══██║╚██╗ ██╔╝
  ╚██████╔╝   ██║   ███████║██║  ██║ ╚████╔╝
   ╚═════╝    ╚═╝   ╚══════╝╚═╝  ╚═╝  ╚═══╝
                          ARORA
`.trimStart();

export function whoami(_args: string[], _state: ShellState): CommandResult {
  const lines: string[] = [];

  lines.push(A.bright(ASCII_ART));
  lines.push(A.amber('─'.repeat(58)));
  lines.push('');
  lines.push(`  ${A.bright('Utsav Arora')}  ${A.dim('//  Software Engineer & AI Researcher')}`);
  lines.push('');
  lines.push(`  ${A.amber('University:')} ${contact.university}`);
  lines.push(`  ${A.amber('Degree:')}     ${contact.degree} — ${contact.concentration}`);
  lines.push(`  ${A.amber('Minors:')}     ${contact.minors.join(', ')}`);
  lines.push(`  ${A.amber('Graduating:')} ${contact.graduation}`);
  lines.push('');
  lines.push(`  ${A.info('─── Experience ───────────────────────────────')}`);
  for (const exp of experiences) {
    lines.push(`  ${A.bright('▸')} ${A.amber(exp.role)}`);
    lines.push(`    ${A.dim(exp.company)}  ${A.dimmer('·')}  ${A.dimmer(exp.period)}`);
  }
  lines.push('');
  lines.push(`  ${A.info('─── Contact ──────────────────────────────────')}`);
  lines.push(`  ${A.amber('Email:')}    ${contact.email}`);
  lines.push(`  ${A.amber('GitHub:')}   ${contact.github}`);
  lines.push(`  ${A.amber('LinkedIn:')} ${contact.linkedin}`);
  lines.push('');
  lines.push(`  ${A.dim('Type')} ${A.bright('help')} ${A.dim('to see all commands.')}`);
  lines.push(`  ${A.dim('Type')} ${A.bright('ls')} ${A.dim('to explore the filesystem.')}`);
  lines.push('');

  return lines.join('\r\n');
}
