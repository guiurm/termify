import { CommandError } from '../CommandError';
import { TOption, TOptionToParsedOption } from '../types';
import { parseValueType } from './commandUtils';

/**
 * Returns true if the given argument string is an option, false otherwise.
 *
 * An option is defined as a string that starts with a hyphen and has at least one
 * other character.
 *
 * @param argument - The argument string to check
 * @returns true if the argument is an option, false otherwise
 */
const isOption = (argument: string): boolean => {
    return argument.length > 1 && argument[0] === '-';
};

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
const extractKeyValue = (option: string) => {
    const match = option.match(/^--?([^=:]+):?=?(.*)?$/);
    if (!match) return { key: null, value: null };

    const [, key, value] = match;
    return { key, value: value ?? null };
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
const parseOption = <O extends TOption>(option: O, value: string | null): TOptionToParsedOption<O> => {
    let { flag, name, optionType, alias, required, defaultValue, customTransformer, customValidator } = option;

    let parsedValue = undefined as string | number | boolean | undefined;

    if (required && value === null) throw new CommandError(`The option "${name}" is required.`);

    if (customValidator) {
        const { error, message = `Error in custom validator for option ${name}` } = customValidator(value || '');
        if (error) throw new CommandError(message);
    }

    if (customTransformer) parsedValue = customTransformer(value);
    else {
        parsedValue = parseValueType(optionType, value);
    }

    if (defaultValue !== undefined && parsedValue === undefined) parsedValue = defaultValue;

    return {
        optionType,
        required: required ?? false,
        alias: alias ?? [],
        flag,
        value: parsedValue,
        name
    } as TOptionToParsedOption<O>;
};

export { extractKeyValue, isOption, parseOption };
