import CommandError from '../CommandError';
import { TOptionType, TOptionTypeValue } from '../types';

export const isOption = (argument: string): boolean => argument.length > 1 && argument[0] === '-';

export const parseOptionValue = (option: string) => {
    const match = option.match(/^--?([^=:]+):?=?(.*)?$/);
    if (!match) return null;

    const [, key, value] = match;
    return { key, value: value || undefined };
};

export const resolveOptionValue = <T extends TOptionType>({
    optionType,
    value,
    defaultValue
}: {
    optionType: T;
    value?: TOptionTypeValue<T>;
    defaultValue?: TOptionTypeValue<T>;
}): TOptionTypeValue<T> => {
    if (optionType === 'undefined' || optionType === 'boolean') {
        return (value ?? defaultValue ?? true) as TOptionTypeValue<T>;
    }

    if (value === undefined && defaultValue === undefined) {
        throw new CommandError('Value is required but not provided');
    }

    switch (optionType) {
        case 'string':
            return value ?? (defaultValue as TOptionTypeValue<T>);
        case 'number':
            return parseFloat((value ?? defaultValue) as string) as TOptionTypeValue<T>;
        default:
            return value ?? (defaultValue as TOptionTypeValue<T>);
    }
};

// Extrae la clave de la opción del argumento
export const extractOptionKey = (argument: string): string | null => {
    const match = argument.match(/^--?([^=]+)(?:=(.*))?$/);
    return match ? match[1] : null;
};
