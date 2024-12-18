import BaseCommand from '../Command';
import { TArgumentType, TArgumentValue, TOption, TOptionToParsedOption } from '../types';
import { resolveOptionValue } from './optionUtils';

/**
 * Converts a command option to a parsed option, which includes the option's value resolved to
 * the correct type and the option's name, flag, aliases, and requirement status.
 *
 * @param option - The command option to parse.
 * @param value - The value of the option to parse.
 * @returns A parsed option representing the parsed option.
 */
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

export { genCommand, parseOption };
