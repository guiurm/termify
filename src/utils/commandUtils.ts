import Command from '../Command';
import { TArgumentType, TArgumentValue, TOption, TOptionToParsedOption } from '../types';
import { resolveOptionValue } from './optionUtils';

const parseOption = <O extends TOption>(option: O, value: string | null) => {
    const resolvedValue = resolveOptionValue({
        optionType: option.optionType,
        value,
        validator: option.customValidator
    });

    return {
        optionType: option.optionType,
        required: option.required ?? false,
        alias: option.alias ?? [],
        flag: option.flag,
        value: resolvedValue,
        name: option.name
    } as TOptionToParsedOption<O>;
};

const genCommand = <Options extends TOption<TArgumentType>[], Arguments extends TArgumentValue<TArgumentType>[]>(
    name: string,
    options?: Options,
    args?: Arguments
) => {
    return new Command({ commandName: name, options, arguments: args });
};

export { genCommand, parseOption };
