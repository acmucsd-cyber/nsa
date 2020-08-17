import adjNoun from 'adj-noun'
import parser from 'yargs-parser'
// const { ArgumentParser } = require('argparse');

// const parser = new ArgumentParser({
//     description: 'Username generator'
// });

// parser.add_argument('--leet', { action: "store_true", help: "Make your username l33t" })

export function generateName(commandArgs: string[]): string {
    // let args = parser.parse_args(commandArgs.slice(1))
    let args = parser(commandArgs.slice(1), {
        default: { leet: false, separator: ' ' },
        boolean: ['leet'],
        string: ['separator'],
    })
    // let remaindingArgs: [] = args._
    // if (remaindingArgs.length != 0) {
    //     console.log(`Unrecognized arguments: ${remaindingArgs.join(' ')}`) // TODO throw exception in this case
    // }
    let name: string[] = adjNoun();
    if (args.leet) {
        for (let i = 0; i < name.length; i++) {
            name[i] = leetify(name[i], 1);
        }
    }
    return name.join(args.separator)
}

const leetTable = new Map([
    ['a', '4'],
    ['e', '3'],
    ['i', '1'],
    ['o', '0'],
    ['s', '5'],
])

function leetify(s: string, coverage: number): string {
    let result: string[] = [];
    for (const char of s) {
        let newchar: string;
        if (Math.random() < coverage && leetTable.has(char)) {
            newchar = leetTable.get(char)
        } else {
            newchar = char
        }
        result.push(newchar)
    }
    return result.join('')
}
