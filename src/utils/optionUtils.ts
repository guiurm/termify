import CommandError from '../CommandError';
import { TOptionType, TOptionTypeValue, TResolveOptionValueConf } from '../types';

const isOption = (argument: string): boolean => argument.length > 1 && argument[0] === '-';

/**
 * Extracts the key and value from a given option string.
 * The option string is expected to be in the format of '--key' or '--key=value'.
 * Returns an object with 'key' and 'value' properties, where 'value' can be null.
 * If the option string does not match the expected format, returns null.
 */
const parseOptionValue = (option: string) => {
    const match = option.match(/^--?([^=:]+):?=?(.*)?$/);
    if (!match) return null;

    const [, key, value] = match;
    return { key, value: value ?? null };
};

/**
 * Resolves a given option value based on the option's type.
 *
 * @param optionType - The type of the option.
 * @param value - The value of the option to resolve.
 * @param validator - A custom validator function to use for resolving the option value.
 *
 * @returns The resolved value of the option. If the option has type 'undefined' or 'boolean' and the value is null, returns true.
 * If the option has type 'string', returns the value as is.
 * If the option has type 'number', parses the value as a number and returns it. If the parsing fails, throws a CommandError.
 * Otherwise, returns the value as is.
 */
const resolveOptionValue = <T extends TOptionType>({
    optionType,
    value,
    validator
}: TResolveOptionValueConf<T>): TOptionTypeValue<T> | undefined => {
    if (validator) return validator(value as TOptionTypeValue<T>);

    if (optionType === 'undefined' || optionType === 'boolean' || value === null) {
        return (value ?? true) as TOptionTypeValue<T>;
    }

    switch (optionType) {
        case 'string':
            return value;
        case 'number':
            const v = parseFloat(value as string);
            if (isNaN(v)) throw new CommandError('Value given is not number');
            return v as TOptionTypeValue<T>;
        default:
            return value;
    }
};

/**
 * Extracts the key from an option argument string.
 *
 * @param argument - The argument from which to extract the key.
 *
 * @returns The extracted key, or null if the argument does not match the option pattern.
 */
const extractOptionKey = (argument: string): string | null => {
    const match = argument.match(/^--?([^=]+)(?:=(.*))?$/);
    return match ? match[1] : null;
};

export { extractOptionKey, isOption, parseOptionValue, resolveOptionValue };
