export type TRequiredRecursive<T> = {
    [K in keyof T]-?: T[K] extends string | number | boolean | [] | ((...args: any[]) => any)
        ? NonNullable<T[K]>
        : TRequiredRecursive<T[K]>;
};

export type TWriteableRecursive<T> = {
    -readonly [K in keyof T]: T[K] extends string | number | boolean | [] | ((...args: any[]) => any)
        ? NonNullable<T[K]>
        : TRequiredRecursive<T[K]>;
};

export type TStringToNumber<S extends string> = S extends `${infer N extends number}` ? N : never;

// option
export type TOptionType = 'boolean' | 'string' | 'number' | 'undefined';
export type TOptionTypeValue<T extends TOptionType> = T extends 'boolean' | 'undefined'
    ? boolean
    : T extends 'string'
      ? string
      : T extends 'number'
        ? number
        : never;

export type TFLag = `-${string}` | `--${string}`;
export type TOption<T extends TOptionType = TOptionType, Flag extends TFLag = TFLag> = {
    optionType: T;
    flag: Flag;
    name: string;
    description?: string;
    alias?: string[];
    required?: boolean;
    defaultValue?: TOptionTypeValue<T>;
    customTransformer?: (data: any) => TOptionTypeValue<T>;
    customValidator?: (data: string) => { error: boolean; message?: string }; //TOptionTypeValue<T>;
};

export type TParsedOption<T extends TOptionType = TOptionType, Flag extends TFLag = TFLag> = Required<
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
    description?: string;
    required?: boolean;
    validator?: (data: string) => { error: boolean; message?: string }; //(data: string) => TOptionTypeValue<T>;
};
export type TArgumentValueParsed<T extends TArgumentType> = TArgumentValue<T> & {
    value: TOptionTypeValue<T>;
};

export type TArgutmentValueToArgumntParsed<V extends TArgumentValue<TArgumentType>> =
    V extends TArgumentValue<infer T> ? TArgumentValueParsed<T> : never;

export type TResolveOptionValueConf<T extends TOptionType> = {
    optionType: T;
    value?: TOptionTypeValue<T> | null;
    validator?: (data: any) => TOptionTypeValue<T>;
};

export type TCommandConstructor<
    CommandName extends string,
    Options extends Array<TOption<TOptionType, any>>,
    Arguments extends Array<TArgumentValue<TArgumentType>>
> = { commandName: CommandName; description?: string; options?: Options; arguments?: Arguments };
