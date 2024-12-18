import CommandError from './CommandError';
import {
    TArgumentType,
    TArgumentValue,
    TArgutmentValueToArgumntParsed,
    TCommandConstructor,
    TOption,
    TOptionToParsedOption,
    TOptionType,
    TOptionTypeValue,
    TStringToNumber
} from './types';
import { parseOption } from './utils/commandUtils';
import { extractOptionKey, isOption, parseOptionValue, resolveOptionValue } from './utils/optionUtils';

type TCommandAction<
    Options extends Array<TOption<TOptionType, any>>,
    Arguments extends Array<TArgumentValue<TArgumentType>>
> = (
    data: {
        options: TOptionToParsedOption<Options[number]>[];
        parsedArgs: TArgutmentValueToArgumntParsed<Arguments[number]>[];
    },
    options: {
        [K in TStringToNumber<keyof Options & string> as Options[K]['name']]: Options[K]['required'] extends true
            ? TOptionTypeValue<Options[K]['optionType']>
            : TOptionTypeValue<Options[K]['optionType']> | undefined;
    },
    args: {
        [K in TStringToNumber<keyof Arguments & string> as Arguments[K]['name']]: Arguments[K]['required'] extends true
            ? TOptionTypeValue<Arguments[K]['type']>
            : TOptionTypeValue<Arguments[K]['type']> | undefined;
    }
) => void | Promise<void>;
export default class BaseCommand<
    CommandName extends string,
    Options extends Array<TOption<TOptionType, any>>,
    Arguments extends Array<TArgumentValue<TArgumentType>>
> {
    private readonly _commandName: CommandName;
    private readonly _options: Options;
    private readonly _arguments: Arguments;
    private _action: TCommandAction<Options, Arguments>;

    constructor(
        {
            commandName,
            arguments: args = [] as unknown as Arguments,
            options = [] as unknown as Options
        }: TCommandConstructor<CommandName, Options, Arguments>,
        action: typeof this._action = () => void 0
    ) {
        this._commandName = commandName;
        this._options = options;
        this._action = action;
        this._arguments = args;
    }

    public async parseArguments(args: string[]): Promise<void> {
        const remainingArgs = args.slice();
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

                parsedOptions.push(parseOption(option, value));
            } else if (!isOption(argument)) {
                const arg = this._arguments[argumentCount] as Arguments[number];
                if (!arg) continue;

                const parsedValue = resolveOptionValue({
                    optionType: arg.type,
                    value: argument,
                    validator: arg.validator
                });
                if (!parsedValue && arg.required)
                    throw new CommandError(`${arg.name} is required ${parsedValue} given`);

                parsedArguments.push({ ...arg, value: parsedValue } as TArgutmentValueToArgumntParsed<typeof arg>);
                argumentCount++;
            }
        }

        for (const element of this._options) {
            const found = parsedOptions.some(a => a.name === element.name);

            if (!found && element.required) throw new CommandError(`${element.name} is not provided`);
        }

        for (const element of this._arguments) {
            const found = parsedArguments.some(a => a.name === element.name);
            if (!found && element.required) throw new CommandError(`${element.name} is not provided`);
        }

        const o = parsedOptions
            .map(o => ({ [o.name]: o.value }))
            .reduce((acc, curr) => ({ ...acc, ...curr }), {}) as any;
        const a = parsedArguments
            .map(o => ({ [o.name]: o.value }))
            .reduce((acc, curr) => ({ ...acc, ...curr }), {}) as any;

        await this._action({ options: parsedOptions, parsedArgs: parsedArguments }, o, a);
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

    public action(fn: TCommandAction<Options, Arguments>) {
        this._action = fn;
        return this;
    }

    public get name(): string {
        return this._commandName;
    }
}
