export type TRequiredRecursive<T> = {
    [K in keyof T]-?: T[K] extends string | number | boolean | [] | ((...args: any[]) => any)
        ? NonNullable<T[K]>
        : TRequiredRecursive<T[K]>;
};

// option
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
    customValidator?: (data: any) => TOptionTypeValue<T>;
};

export type TParsedOption<T extends TOptionType = TOptionType, Flag extends string = string> = Required<
    Omit<TOption<T, Flag>, 'defaultValue'>
> & {
    value: TOptionTypeValue<T>;
};

export type TOptionToParsedOption<O extends TOption> =
    O extends TOption<infer I, infer P> ? TParsedOption<I, P> : never;

// arguments
export type TArgumentType = Exclude<TOptionType, 'undefined'>;
export type TArgumentValue<T extends TArgumentType> = {
    type: T;
    name: string;
    required?: boolean;
    validator?: (data: string) => TOptionTypeValue<T>;
};
export type TArgumentValueParsed<T extends TArgumentType> = TArgumentValue<T> & {
    value: TOptionTypeValue<T>;
};

export type TArgutmentValueToArgumntParsed<V extends TArgumentValue<TArgumentType>> =
    V extends TArgumentValue<infer T> ? TArgumentValueParsed<T> : never;
