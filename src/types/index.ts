export type TRequiredRecursive<T> = {
    [K in keyof T]-?: T[K] extends string | number | boolean | [] | ((...args: any[]) => any)
        ? NonNullable<T[K]>
        : TRequiredRecursive<T[K]>;
};

//

export type TOptionType = 'boolean' | 'string' | 'number' | 'undefined';
export type TOptionTypeValue<T extends TOptionType> = T extends 'boolean' | 'undefined'
    ? boolean
    : T extends 'string'
        ? string
        : T extends 'number'
            ? number
            : never;

export type TOption<T extends TOptionType = TOptionType, Flag extends string = string> = {
    optionType: T;
    flag: Flag;
    alias?: string[];
    required?: boolean;
    defaultValue?: TOptionTypeValue<T>;
};

export type TParsedOption<T extends TOptionType = TOptionType, Flag extends string = string> = Required<
    Omit<TOption<T, Flag>, 'defaultValue'>
> & {
    value: TOptionTypeValue<T>;
};

export type TOptionToParsedOption<O extends TOption> = O extends TOption<infer I, infer P> ? TParsedOption<I, P> : never;
