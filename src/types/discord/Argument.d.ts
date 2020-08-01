
export default interface Argument {
    names: string[],
    description: string,
    defaultValue: string | number | boolean
}

export interface ArgumentValue {
    asString: () => string,
    asNumber: () => number,
    asBoolean: () => boolean
}

export interface Flag extends Argument {

}

export interface Parameter extends Argument {
    required: boolean
}

export interface ParsingResult {
    value: ArgumentValue,
    strippedCommand: string,
    error: ParsingError
}

export interface ParsingError {
    fatal: boolean,
    message: string
}