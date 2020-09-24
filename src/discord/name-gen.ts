import { MessageEmbed } from 'discord.js';
import adjNoun from 'adj-noun';
import parser from 'yargs-parser';

import commands from './command-strings';

// const { ArgumentParser } = require('argparse');

const SEED_RANGE = 2147483648; // must be significantly smaller than Number.MAX_SAFE_INTEGER or adj-noun may give undefined stuff on fractional values

// const parser = new ArgumentParser({
//     description: 'Username generator'
// });

// parser.add_argument('--leet', { action: "store_true", help: "Make your username l33t" })

const leetTable = new Map([
  ['a', '4'],
  ['e', '3'],
  ['i', '1'],
  ['o', '0'],
  ['s', '5'],
]);

const leetify = (s: string, coverage: number): string => {
  const result: string[] = [];
  for (const char of s) {
    let newchar: string;
    if (Math.random() < coverage && leetTable.has(char)) {
      newchar = leetTable.get(char);
    } else {
      newchar = char;
    }
    result.push(newchar);
  }
  return result.join('');
};

export default function generateName(commandArgs: string[], embed: MessageEmbed): void {
  adjNoun.seed(Math.floor(Math.random() * SEED_RANGE));
  // let args = parser.parse_args(commandArgs.slice(1))
  const args = parser(commandArgs.slice(1), {
    default: { leet: false, help: false, separator: ' ' },
    boolean: ['leet', 'help'],
    string: ['separator'],
  });
  // let remaindingArgs: [] = args._
  // if (remaindingArgs.length != 0) {
  //     console.log(`Unrecognized arguments: ${remaindingArgs.join(' ')}`) // TODO throw exception in this case
  // }
  let name: string[] = adjNoun();
  if (args.help) {
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
