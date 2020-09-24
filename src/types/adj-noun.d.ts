declare function adjNoun(): string[]; // default export (actually named next in JS module but used module name to increase clarity)
declare namespace adjNoun {
  export function next(): string[]; // same function as the default export above, to reflect actual content in JS module.
  export function seed(newSeed: number): boolean;
  export function adjPrime(newPrime: number): boolean;
  export function nounPrime(newPrime: number): boolean;
}

export = adjNoun;
