#!/usr/bin/env node

import CommandError from './CommandError';
import {
    TArgumentType,
    TArgumentValue,
    TArgutmentValueToArgumntParsed,
    TOption,
    TOptionToParsedOption,
    TOptionType
} from './types';
import { extractOptionKey, isOption, parseOptionValue, resolveOptionValue } from './utils/optionUtils';

type TCommandConstructor<
    CommandName extends string,
    Options extends Array<TOption<TOptionType, any>>,
    Arguments extends Array<TArgumentValue<TArgumentType>>
> = { commandName: CommandName; options?: Options; arguments?: Arguments };

class CommandParser<
    CommandName extends string,
    Options extends Array<TOption<TOptionType, any>>,
    Arguments extends Array<TArgumentValue<TArgumentType>>
> {
    private readonly _commandName: CommandName;
    private readonly _options: Options;
    private readonly _arguments: Arguments;
    private _action: (data: {
        options: TOptionToParsedOption<Options[number]>[];
        parsedArgs: TArgutmentValueToArgumntParsed<Arguments[number]>[];
    }) => void;

    constructor({
        commandName,
        arguments: args = [] as unknown as Arguments,
        options = [] as unknown as Options
    }: TCommandConstructor<CommandName, Options, Arguments>) {
        this._commandName = commandName;
        this._options = options;
        this._action = () => {};
        this._arguments = args;
    }

    public parseArguments(args: string[]): void {
        const remainingArgs = args.slice();
        remainingArgs.shift();
        const parsedOptions: TOptionToParsedOption<Options[number]>[] = [];
        const parsedArguments: TArgutmentValueToArgumntParsed<Arguments[number]>[] = [];

        let argumentCount = 0;
        while (remainingArgs.length) {
            const argument = remainingArgs.shift();
            if (!argument || argument === '--') break;

            let option = null as null | Options[number];
            if (isOption(argument)) option = this._findOption(argument);

            if (option) {
                let { key, value } = parseOptionValue(argument) ?? { key: null, value: null };

                if (!value) value = remainingArgs.shift() ?? null;
                if (!value && option.required)
                    throw new CommandError(`The option "${key}" requires a value as '${option.optionType}'`);

                if (option.required && !value) {
                    throw new CommandError(`The option "${key}" requires a value`);
                }

                const resolvedValue = resolveOptionValue({
                    optionType: option.optionType,
                    value: value === null ? undefined : value,
                    validator: option.customValidator
                });

                parsedOptions.push({
                    optionType: option.optionType,
                    required: option.required ?? false,
                    alias: option.alias ?? [],
                    flag: option.flag,
                    value: resolvedValue
                } as TOptionToParsedOption<Options[number]>);
            } else {
                const arg = this._arguments[0] as Arguments[number];
                const parsedValue = resolveOptionValue({
                    optionType: arg.type,
                    value: argument,
                    validator: arg.validator
                });
                if (!parsedValue && arg.required)
                    throw new CommandError(`${arg.name} is required ${parsedValue} given`);

                parsedArguments.push({ ...arg, value: parsedValue } as TArgutmentValueToArgumntParsed<typeof arg>);
            }
        }

        this._action({ options: parsedOptions, parsedArgs: parsedArguments });
    }

    private _findOption(argument: string) {
        const key = extractOptionKey(argument);
        if (!key) return null;

        return (
            this._options.find(option => {
                return (
                    extractOptionKey(option.flag) === key ||
                    option.alias?.some(alias => extractOptionKey(alias) === key)
                );
            }) ?? null
        );
    }

    public action(fn: typeof this._action) {
        this._action = fn;
    }
}

const command = new CommandParser({
    commandName: 'ci',
    options: [
        { optionType: 'string', required: true, flag: '-url', alias: ['--web-url'], defaultValue: 'abc.com' },
        { optionType: 'number', required: true, flag: '-to', defaultValue: 1 }
    ] as const,
    arguments: [{ name: 'user', required: false, type: 'string' }] as const
});
command.action(({ options, parsedArgs }) => {
    console.log(options);
    console.log(parsedArgs);
});

command.parseArguments(process.argv.slice(2));
