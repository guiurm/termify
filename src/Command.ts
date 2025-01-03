import { CommandError } from './CommandError';
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
import { parseArgument } from './utils/commandUtils';
import { extractKeyValue, isHelp, isOption, parseOption } from './utils/optionUtils';

type TCommandAction<
    Options extends Array<TOption<TOptionType, any>>,
    Arguments extends Array<TArgumentValue<TArgumentType>>
> = (
    options: {
        [K in TStringToNumber<keyof Options & string> as Options[K]['name']]: Options[K]['required'] extends true
            ? TOptionTypeValue<Options[K]['optionType']>
            : Options[K]['optionType'] extends 'boolean'
              ? TOptionTypeValue<Options[K]['optionType']>
              : TOptionTypeValue<Options[K]['optionType']> | undefined;
    },
    args: {
        [K in TStringToNumber<keyof Arguments & string> as Arguments[K]['name']]: Arguments[K]['required'] extends true
            ? TOptionTypeValue<Arguments[K]['type']>
            : TOptionTypeValue<Arguments[K]['type']> | undefined;
    }
) => void | Promise<void>;

class BaseCommand<
    CommandName extends string,
    Options extends Array<TOption<TOptionType, any>>,
    Arguments extends Array<TArgumentValue<TArgumentType>>
> {
    private readonly _commandName: CommandName;
    private readonly _description?: string;
    private readonly _options: Options;
    private readonly _arguments: Arguments;
    private _action: TCommandAction<Options, Arguments>;

    constructor(
        {
            commandName,
            description,
            arguments: args = [] as unknown as Arguments,
            options = [] as unknown as Options
        }: TCommandConstructor<CommandName, Options, Arguments>,
        action: typeof this._action = () => void 0
    ) {
        this._commandName = commandName;
        this._description = description;
        this._options = options;
        this._action = action;
        this._arguments = args;
    }

    public async parseArguments(args: string[]): Promise<void> {
        const remainingArgs = args.slice();
        const parsedOptions: TOptionToParsedOption<Options[number]>[] = [];
        const parsedArguments: TArgutmentValueToArgumntParsed<Arguments[number]>[] = [];

        if (isHelp(remainingArgs[0])) {
            console.log(this.help);
            return;
        }

        let argumentCount = 0;
        while (remainingArgs.length) {
            const argument = remainingArgs.shift();

            if (!argument || argument === '--') break;

            let option = null as null | Options[number];
            if (isOption(argument)) option = this._findOption(argument);

            if (option) {
                let { value } = extractKeyValue(argument);

                if (!value && option.optionType !== 'boolean') value = remainingArgs.shift() ?? null;

                parsedOptions.push(parseOption(option, value));
            } else if (!isOption(argument)) {
                const arg = this._arguments[argumentCount] as Arguments[number];
                if (!arg) continue;

                parsedArguments.push(parseArgument(arg, argument));
                argumentCount++;
            }
        }

        for (const element of this._options) {
            const found = parsedOptions.some(a => a.name === element.name);

            if (!found && element.required) throw new CommandError(`${element.name} is not provided`);

            if (!found && element.defaultValue !== undefined)
                switch (element.optionType) {
                    case 'string':
                        parsedOptions.push({
                            ...element,
                            value: element.defaultValue
                        } as TOptionToParsedOption<Options[number]>);
                        break;
                    case 'number':
                        parsedOptions.push({
                            ...element,
                            value: element.defaultValue
                        } as TOptionToParsedOption<Options[number]>);
                        break;
                    case 'boolean':
                        parsedOptions.push({
                            ...element,
                            value: element.defaultValue
                        } as TOptionToParsedOption<Options[number]>);
                        break;
                }
            else if (!found && element.optionType === 'boolean')
                parsedOptions.push({
                    ...element,
                    value: false
                } as TOptionToParsedOption<Options[number]>);
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

        await this._action(o, a);
    }

    private _findOption(argument: string) {
        const { key } = extractKeyValue(argument);
        if (!key) return null;

        return (
            this._options.find(option => {
                return (
                    extractKeyValue(option.flag).key === key ||
                    option.alias?.some(alias => extractKeyValue(alias).key === key)
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

    public get help(): string {
        return (
            `${this._commandName} [options] [arguments]\n\n` +
            ` ${this._description ?? 'No description available for this command'}\n\n` +
            ' Options:\n' +
            `${this._options
                .map(
                    o =>
                        '   ' +
                        o.flag +
                        ' ' +
                        o.alias?.join(' ') +
                        '    ' +
                        (o.description
                            ? o.description.toUpperCase()
                            : (o.required ? 'required' : 'optional') + ' ' + o.optionType) +
                        '\n'
                )
                .join('')}\n\n` +
            (this._arguments.length > 0 ? ` Arguments:\n` : '') +
            `${this._arguments.map(a => `   <${a.name}>    ${a.description ? a.description.toUpperCase() : (a.required ? ' required' : ' optional') + ' ' + a.type}`).join('\n')}`
        );
    }
}

export { BaseCommand };
