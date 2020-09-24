import { MessageEmbed } from 'discord.js';
import adjNoun from 'adj-noun';
import parser from 'yargs-parser';

import commands from './command-strings';

const SEED_RANGE = 2147483648; // must be significantly smaller than Number.MAX_SAFE_INTEGER or adj-noun may give undefined stuff on fractional values

const LEET_TABLE = new Map([
  ['a', '4'],
  ['e', '3'],
  ['i', '1'],
  ['o', '0'],
  ['s', '5'],
]);
const LEET_REPLACE_CHARS = /[aeios]/g;

const leetify = (s: string, coverage: number) => s.replace(LEET_REPLACE_CHARS,
  (char) => ((Math.random() < coverage) ? LEET_TABLE.get(char) : char));

export default function generateName(commandArgs: string[], embed: MessageEmbed): void {
  adjNoun.seed(Math.floor(Math.random() * SEED_RANGE));
  const args = parser(commandArgs.slice(1), {
    default: { leet: false, help: false, separator: ' ' },
    boolean: ['leet', 'help'],
    string: ['separator'],
  });
  // let remaindingArgs: [] = args._
  // if (remaindingArgs.length != 0) {
  //     console.log(`Unrecognized arguments: ${remaindingArgs.join(' ')}`)
  // }
  let name: string[] = adjNoun();
  if (args.help) { // Provide help message
    embed.addFields(commands.find((command) => command.name === 'name').fields);
    return;
  }
  if (args.leet) {
    // for (let i = 0; i < name.length; i++) {
    //   name[i] = leetify(name[i], 1);
    // }
    name = name.map((s) => leetify(s, 1));
  }
  embed.setDescription(name.join(args.separator));
}
