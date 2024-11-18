import CommandError from '../CommandError';
import { TOptionType, TOptionTypeValue, TResolveOptionValueConf } from '../types';

export const isOption = (argument: string): boolean => argument.length > 1 && argument[0] === '-';

export const parseOptionValue = (option: string) => {
    const match = option.match(/^--?([^=:]+):?=?(.*)?$/);
    if (!match) return null;

    const [, key, value] = match;
    return { key, value: value ?? null };
};

export const resolveOptionValue = <T extends TOptionType>({
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

export const extractOptionKey = (argument: string): string | null => {
    const match = argument.match(/^--?([^=]+)(?:=(.*))?$/);
    return match ? match[1] : null;
};
