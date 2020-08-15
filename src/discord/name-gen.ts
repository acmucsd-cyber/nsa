const adjNoun = require('adj-noun');

export function generateName(commandArgs: string[]): string {
    let name: string[] = adjNoun();
    return name.join(' ')
}
