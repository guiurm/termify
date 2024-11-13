#!/usr/bin/env node

import CommandError from './CommandError';
import { TOption, TOptionToParsedOption, TOptionType } from './types';
import { extractOptionKey, isOption, parseOptionValue, resolveOptionValue } from './utils/optionUtils';

class CommandParser<CommandName extends string, Options extends Array<TOption<TOptionType, any>>> {
    private readonly commandName: CommandName;
    private readonly options: Options;

    constructor(commandName: CommandName, options: Options = [] as unknown as Options) {
        this.commandName = commandName;
        this.options = options;
    }

    public parseArguments(args: string[]): void {
        const remainingArgs = args.slice();
        const parsedOptions: TOptionToParsedOption<Options[number]>[] = [];

        while (remainingArgs.length) {
            const argument = remainingArgs.shift();
            if (!argument || argument === '--') break;

            if (isOption(argument)) {
                const option = this.findOption(argument);
                if (!option) throw new CommandError(`Option "${argument}" not found`);

                const parsedValue = parseOptionValue(argument);
                if (!parsedValue) throw new CommandError(`Invalid option format for argument: "${argument}"`);

                parsedValue.value = parsedValue.value ?? remainingArgs.shift();
                if (option.required && !parsedValue.value) {
                    throw new CommandError(`The option "${parsedValue.key}" requires a value`);
                }

                const resolvedValue = resolveOptionValue({
                    optionType: option.optionType,
                    value: parsedValue.value,
                    defaultValue: option.defaultValue
                });

                parsedOptions.push({
                    optionType: option.optionType,
                    required: option.required ?? false,
                    alias: option.alias ?? [],
                    flag: option.flag,
                    value: resolvedValue
                } as TOptionToParsedOption<Options[number]>);
            }
        }
    }

    private findOption(argument: string) {
        const key = extractOptionKey(argument);
        if (!key) return undefined;

        return this.options.find(option => {
            return (
                extractOptionKey(option.flag) === key || option.alias?.some(alias => extractOptionKey(alias) === key)
            );
        });
    }
}

const command = new CommandParser('ci', [
    { optionType: 'string', required: true, flag: '-url', alias: ['--web-url'], defaultValue: 'abc.com' },
    { optionType: 'number', required: true, flag: '-to', defaultValue: 1 }
] as const);

command.parseArguments(process.argv.slice(2));
