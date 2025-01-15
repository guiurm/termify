type TRequiredRecursive<T> = {
    [K in keyof T]-?: T[K] extends string | number | boolean | [] | ((...args: any[]) => any) ? NonNullable<T[K]> : TRequiredRecursive<T[K]>;
};
type TWriteableRecursive<T> = {
    -readonly [K in keyof T]: T[K] extends string | number | boolean | [] | ((...args: any[]) => any) ? NonNullable<T[K]> : TRequiredRecursive<T[K]>;
};
type TStringToNumber<S extends string> = S extends `${infer N extends number}` ? N : never;
type TOptionType = 'boolean' | 'string' | 'number' | 'undefined';
type TOptionTypeValue<T extends TOptionType> = T extends 'boolean' | 'undefined' ? boolean : T extends 'string' ? string : T extends 'number' ? number : never;
type TFLag = `-${string}` | `--${string}`;
type TOption<T extends TOptionType = TOptionType, Flag extends TFLag = TFLag> = {
    optionType: T;
    flag: Flag;
    name: string;
    description?: string;
    alias?: string[];
    required?: boolean;
    defaultValue?: TOptionTypeValue<T>;
    customTransformer?: (data: any) => TOptionTypeValue<T>;
    customValidator?: (data: string) => {
        error: boolean;
        message?: string;
    };
};
type TParsedOption<T extends TOptionType = TOptionType, Flag extends TFLag = TFLag> = Required<Omit<TOption<T, Flag>, 'defaultValue'>> & {
    value: TOptionTypeValue<T>;
};
type TOptionToParsedOption<O extends TOption> = O extends TOption<infer I, infer P> ? TParsedOption<I, P> : never;
type TArgumentType = Exclude<TOptionType, 'undefined'>;
type TArgumentValue<T extends TArgumentType> = {
    type: T;
    name: string;
    description?: string;
    required?: boolean;
    validator?: (data: string) => {
        error: boolean;
        message?: string;
    };
};
type TArgumentValueParsed<T extends TArgumentType> = TArgumentValue<T> & {
    value: TOptionTypeValue<T>;
};
type TArgutmentValueToArgumntParsed<V extends TArgumentValue<TArgumentType>> = V extends TArgumentValue<infer T> ? TArgumentValueParsed<T> : never;
type TResolveOptionValueConf<T extends TOptionType> = {
    optionType: T;
    value?: TOptionTypeValue<T> | null;
    validator?: (data: any) => TOptionTypeValue<T>;
};
type TCommandConstructor<CommandName extends string, Options extends Array<TOption<TOptionType, any>>, Arguments extends Array<TArgumentValue<TArgumentType>>> = {
    commandName: CommandName;
    description?: string;
    options?: Options;
    arguments?: Arguments;
};

type TCommandAction<Options extends Array<TOption<TOptionType, any>>, Arguments extends Array<TArgumentValue<TArgumentType>>> = (options: {
    [K in TStringToNumber<keyof Options & string> as Options[K]['name']]: Options[K]['required'] extends true ? TOptionTypeValue<Options[K]['optionType']> : Options[K]['optionType'] extends 'boolean' ? TOptionTypeValue<Options[K]['optionType']> : TOptionTypeValue<Options[K]['optionType']> | undefined;
}, args: {
    [K in TStringToNumber<keyof Arguments & string> as Arguments[K]['name']]: Arguments[K]['required'] extends true ? TOptionTypeValue<Arguments[K]['type']> : TOptionTypeValue<Arguments[K]['type']> | undefined;
}) => void | Promise<void>;
declare class BaseCommand<CommandName extends string, Options extends Array<TOption<TOptionType, any>>, Arguments extends Array<TArgumentValue<TArgumentType>>> {
    private readonly _commandName;
    private readonly _description?;
    private readonly _options;
    private readonly _arguments;
    private _action;
    constructor({ commandName, description, arguments: args, options }: TCommandConstructor<CommandName, Options, Arguments>, action?: typeof this._action);
    parseArguments(args: string[]): Promise<void>;
    private _findOption;
    action(fn: TCommandAction<Options, Arguments>): this;
    get name(): string;
    get help(): string;
}

declare class CommandError extends Error {
    constructor(message: string);
}

declare class Termify<Commands extends Array<BaseCommand<any, any, any>>> {
    private readonly _commands;
    private readonly _appName;
    private readonly _version;
    constructor({ commands, appName, version }: {
        commands: Commands;
        appName: string;
        version: string;
    });
    /**
     * Starts the CLI by parsing the arguments and executing the corresponding command.
     *
     * @throws {CommandError} If the command name does not exists.
     */
    start(rawArgs?: string): Promise<void>;
    private _getHelp;
}

/**
 * Parses an argument and its value into a structured format.
 *
 * @template A - The type of the argument being parsed.
 * @param arg - The argument object containing metadata such as name, type, and validation rules.
 * @param value - The value associated with the argument, which may be null.
 * @returns A parsed argument object containing the processed value and argument metadata.
 * @throws CommandError - Throws an error if the argument is required but not provided, or if custom validation fails.
 */
declare const parseArgument: <A extends TArgumentValue<TArgumentType>>(arg: A, value: string | null) => TArgutmentValueToArgumntParsed<A>;
/**
 * Parses a value according to the given option type.
 *
 * @param optionType - The type of the option, which determines how the value is parsed.
 * @param value - The value to parse, which may be null.
 * @returns A parsed value, which may be undefined if the option type is 'string' and the value is null.
 * @throws CommandError - Throws an error if the value given for a 'number' option is not a valid number.
 */
declare const parseValueType: (optionType: TOptionType, value: string | null) => string | number | boolean | undefined;
/**
 * Generates a new instance of BaseCommand.
 *
 * @param name - The name of the command.
 * @param options - An optional array of command options, each defined by a TOption<TArgumentType>.
 * @param args - An optional array of command arguments, each defined by a TArgumentValue<TArgumentType>.
 * @returns A new BaseCommand instance with the specified name, options, and arguments.
 */
declare const genCommand: <Options extends TOption<TArgumentType>[], Arguments extends TArgumentValue<TArgumentType>[]>({ name, args, options }: {
    name: string;
    options?: Options;
    args?: Arguments;
}) => BaseCommand<string, Options, Arguments>;

/**
 * Returns true if the given argument string is an option, false otherwise.
 *
 * An option is defined as a string that starts with a hyphen and has at least one
 * other character.
 *
 * @param argument - The argument string to check
 * @returns true if the argument is an option, false otherwise
 */
declare const isOption: (argument: string) => boolean;
/**
 * Determines if the given string is a help flag.
 *
 * Recognizes '--help', '-help', and '-h' as valid help flags.
 *
 * @param v - The string to check
 * @returns true if the string is a help flag, false otherwise
 */
declare const isHelp: (v: string) => boolean;
/**
 * Parses an option string into a key-value pair.
 *
 * @param option - The option string to parse, which may include a key and a value
 * separated by an equal sign or a colon, and may start with one or two hyphens.
 *
 * @returns An object containing the extracted key and value. If the option string
 * does not match the expected pattern, returns an object with both key and value
 * set to null. If the value is not provided in the option string, it defaults to null.
 */
declare const extractKeyValue: (option: string) => {
    key: null;
    value: null;
} | {
    key: string;
    value: string;
};
/**
 * Parses an option and its value into a structured format.
 *
 * @template O - The type of the option being parsed.
 * @param option - The option object containing metadata such as name, type, and validation rules.
 * @param value - The value associated with the option, which may be null.
 * @returns A parsed option object containing the processed value and option metadata.
 * @throws CommandError - Throws an error if the option is required but not provided, or if custom validation fails.
 */
declare const parseOption: <O extends TOption>(option: O, value: string | null) => TOptionToParsedOption<O>;

export { BaseCommand, CommandError, type TArgumentType, type TArgumentValue, type TArgumentValueParsed, type TArgutmentValueToArgumntParsed, type TCommandConstructor, type TFLag, type TOption, type TOptionToParsedOption, type TOptionType, type TOptionTypeValue, type TParsedOption, type TRequiredRecursive, type TResolveOptionValueConf, type TStringToNumber, type TWriteableRecursive, Termify, extractKeyValue, genCommand, isHelp, isOption, parseArgument, parseOption, parseValueType };
