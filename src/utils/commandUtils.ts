import BaseCommand from '../Command';
import { CommandError } from '../CommandError';
import { TArgumentType, TArgumentValue, TArgutmentValueToArgumntParsed, TOption, TOptionType } from '../types';

/**
 * Parses an argument and its value into a structured format.
 *
 * @template A - The type of the argument being parsed.
 * @param arg - The argument object containing metadata such as name, type, and validation rules.
 * @param value - The value associated with the argument, which may be null.
 * @returns A parsed argument object containing the processed value and argument metadata.
 * @throws CommandError - Throws an error if the argument is required but not provided, or if custom validation fails.
 */
const parseArgument = <A extends TArgumentValue<TArgumentType>>(arg: A, value: string | null) => {
    let { name, required, type, validator } = arg;

    if (required && value === null) throw new CommandError(`The option "${name}" is required.`);
    let parsedValue = undefined as string | number | boolean | undefined;

    if (validator) {
        const { error, message = `Error in custom validator for option ${name}` } = validator(value || '');
        if (error) throw new CommandError(message);
    }

    parsedValue = parseValueType(type, value);

    const a = {
        name,
        required: required ?? false,
        value: parsedValue,
        type: type,
        validator
    } as TArgutmentValueToArgumntParsed<A>;

    return a;
};

/**
 * Parses a value according to the given option type.
 *
 * @param optionType - The type of the option, which determines how the value is parsed.
 * @param value - The value to parse, which may be null.
 * @returns A parsed value, which may be undefined if the option type is 'string' and the value is null.
 * @throws CommandError - Throws an error if the value given for a 'number' option is not a valid number.
 */
const parseValueType = (optionType: TOptionType, value: string | null): string | number | boolean | undefined => {
    let parsedValue = undefined as string | number | boolean | undefined;
    switch (optionType) {
        case 'string':
            parsedValue = value ?? undefined;
            break;
        case 'number':
            if (value === null) return undefined;
            parsedValue = parseFloat(value as string);
            if (isNaN(parsedValue)) throw new CommandError('Value given is not number');
            break;
        case 'boolean':
            if (value === null) {
                parsedValue = true;
            } else if (value === 'true') {
                parsedValue = true;
            } else if (value === 'false') {
                parsedValue = false;
            } else {
                parsedValue = true;
            }
            break;
    }

    return parsedValue;
};

/**
 * Generates a new instance of BaseCommand.
 *
 * @param name - The name of the command.
 * @param options - An optional array of command options, each defined by a TOption<TArgumentType>.
 * @param args - An optional array of command arguments, each defined by a TArgumentValue<TArgumentType>.
 * @returns A new BaseCommand instance with the specified name, options, and arguments.
 */
const genCommand = <Options extends TOption<TArgumentType>[], Arguments extends TArgumentValue<TArgumentType>[]>({
    name,
    args,
    options
}: {
    name: string;
    options?: Options;
    args?: Arguments;
}) => {
    return new BaseCommand({ commandName: name, options, arguments: args });
};

export { genCommand, parseArgument, parseValueType };
