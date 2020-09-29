import { MessageEmbed } from 'discord.js';
import adjNoun from 'adj-noun';
import parser from 'yargs-parser';

import commands from './command-strings';

const LEET_TABLE = new Map([
  ['a', '4'],
  ['e', '3'],
  ['i', '1'],
  ['o', '0'],
  ['s', '5'],
]);
const LEET_REPLACE_CHARS = /[aeios]/g;

const leetify = (s: string, fractionLeet: number) => s.replace(LEET_REPLACE_CHARS,
  (char) => ((Math.random() < fractionLeet) ? LEET_TABLE.get(char) : char));

export default function generateName(commandArgs: string[], embed: MessageEmbed): void {
  const args = parser(commandArgs.slice(1), {
    default: {
      leet: false,
      help: false,
      separator: ' ',
      fractionLeet: 0.7,
    },
    boolean: ['leet', 'help'],
    number: ['fractionLeet'],
    string: ['separator'],
  });
  const remainingArgs = args._;
  if (remainingArgs.length !== 0) {
    embed.setDescription(`**Error:** Unrecognized argument(s): ${remainingArgs.join(' ')}.
Run \`-name --help\` to get the command syntax, including a list of allowed options.`);
    return;
  }
  const fractionLeet = args.fractionLeet as number;
  // console.log(`Running generate name with leet fraction ${fractionLeet}.`);
  if (Number.isNaN(fractionLeet)) {
    embed.setDescription('**Error:** Fraction leet you provided is not a number');
    return;
  }
  if (fractionLeet > 1 || fractionLeet < 0) {
    embed.setDescription(`**Error:** Fraction leet you provided ${fractionLeet} is not within the valid range: [0.0 - 1.0]`);
    return;
  }
  let name = adjNoun();
  if (args.help as boolean) { // Provide help message
    embed.addFields(commands.find((command) => command.name === 'name').fields);
    return;
  }
  if (args.leet as boolean) {
    name = name.map((s) => leetify(s, fractionLeet));
  }
  embed.setDescription(name.join(args.separator as string));
}
