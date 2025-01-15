class CommandError extends Error {
    constructor(message) {
        super(message);
    }
}

/**
 * Parses an argument and its value into a structured format.
 *
 * @template A - The type of the argument being parsed.
 * @param arg - The argument object containing metadata such as name, type, and validation rules.
 * @param value - The value associated with the argument, which may be null.
 * @returns A parsed argument object containing the processed value and argument metadata.
 * @throws CommandError - Throws an error if the argument is required but not provided, or if custom validation fails.
 */
const parseArgument = (arg, value) => {
    let { name, required, type, validator } = arg;
    if (required && value === null)
        throw new CommandError(`The option "${name}" is required.`);
    let parsedValue = undefined;
    if (validator) {
        const { error, message = `Error in custom validator for option ${name}` } = validator(value || '');
        if (error)
            throw new CommandError(message);
    }
    parsedValue = parseValueType(type, value);
    const a = {
        name,
        required: required ?? false,
        value: parsedValue,
        type: type,
        validator
    };
    return a;
};
/**
 * Parses a value according to the given option type.
 *
 * @param optionType - The type of the option, which determines how the value is parsed.
 * @param value - The value to parse, which may be null.
 * @returns A parsed value, which may be undefined if the option type is 'string' and the value is null.
 * @throws CommandError - Throws an error if the value given for a 'number' option is not a valid number.
 */
const parseValueType = (optionType, value) => {
    let parsedValue = undefined;
    switch (optionType) {
        case 'string':
            parsedValue = value ?? undefined;
            break;
        case 'number':
            if (value === null)
                return undefined;
            parsedValue = parseFloat(value);
            if (isNaN(parsedValue))
                throw new CommandError('Value given is not number');
            break;
        case 'boolean':
            if (value === null) {
                parsedValue = true;
            }
            else if (value === 'true') {
                parsedValue = true;
            }
            else if (value === 'false') {
                parsedValue = false;
            }
            else {
                parsedValue = true;
            }
            break;
    }
    return parsedValue;
};
/**
 * Generates a new instance of BaseCommand.
 *
 * @param name - The name of the command.
 * @param options - An optional array of command options, each defined by a TOption<TArgumentType>.
 * @param args - An optional array of command arguments, each defined by a TArgumentValue<TArgumentType>.
 * @returns A new BaseCommand instance with the specified name, options, and arguments.
 */
const genCommand = ({ name, args, options }) => {
    return new BaseCommand({ commandName: name, options, arguments: args });
};

/**
 * Returns true if the given argument string is an option, false otherwise.
 *
 * An option is defined as a string that starts with a hyphen and has at least one
 * other character.
 *
 * @param argument - The argument string to check
 * @returns true if the argument is an option, false otherwise
 */
const isOption = (argument) => {
    return argument.length > 1 && argument[0] === '-';
};
/**
 * Determines if the given string is a help flag.
 *
 * Recognizes '--help', '-help', and '-h' as valid help flags.
 *
 * @param v - The string to check
 * @returns true if the string is a help flag, false otherwise
 */
const isHelp = (v) => {
    if (!v)
        return false;
    if (['--help', '-help', '-h'].includes(v))
        return true;
    else
        return false;
};
/**
 * Parses an option string into a key-value pair.
 *
 * @param option - The option string to parse, which may include a key and a value
 * separated by an equal sign or a colon, and may start with one or two hyphens.
 *
 * @returns An object containing the extracted key and value. If the option string
 * does not match the expected pattern, returns an object with both key and value
 * set to null. If the value is not provided in the option string, it defaults to null.
 */
const extractKeyValue = (option) => {
    const match = option.match(/^--?([^=:]+):?=?(.*)?$/);
    if (!match)
        return { key: null, value: null };
    const [, key, value] = match;
    return { key, value: value ?? null };
};
/**
 * Parses an option and its value into a structured format.
 *
 * @template O - The type of the option being parsed.
 * @param option - The option object containing metadata such as name, type, and validation rules.
 * @param value - The value associated with the option, which may be null.
 * @returns A parsed option object containing the processed value and option metadata.
 * @throws CommandError - Throws an error if the option is required but not provided, or if custom validation fails.
 */
const parseOption = (option, value) => {
    let { flag, name, optionType, alias, required, defaultValue, customTransformer, customValidator } = option;
    let parsedValue = undefined;
    if (required && value === null)
        throw new CommandError(`The option "${name}" is required.`);
    if (customValidator) {
        const { error, message = `Error in custom validator for option ${name}` } = customValidator(value || '');
        if (error)
            throw new CommandError(message);
    }
    if (customTransformer)
        parsedValue = customTransformer(value);
    else {
        parsedValue = parseValueType(optionType, value);
    }
    if (defaultValue !== undefined && parsedValue === undefined)
        parsedValue = defaultValue;
    return {
        optionType,
        required: required ?? false,
        alias: alias ?? [],
        flag,
        value: parsedValue,
        name
    };
};

class BaseCommand {
    _commandName;
    _description;
    _options;
    _arguments;
    _action;
    constructor({ commandName, description, arguments: args = [], options = [] }, action = () => void 0) {
        this._commandName = commandName;
        this._description = description;
        this._options = options;
        this._action = action;
        this._arguments = args;
    }
    async parseArguments(args) {
        const remainingArgs = args.slice();
        const parsedOptions = [];
        const parsedArguments = [];
        if (isHelp(remainingArgs[0])) {
            console.log(this.help);
            return;
        }
        let argumentCount = 0;
        while (remainingArgs.length) {
            const argument = remainingArgs.shift();
            if (!argument || argument === '--')
                break;
            let option = null;
            if (isOption(argument))
                option = this._findOption(argument);
            if (option) {
                let { value } = extractKeyValue(argument);
                if (!value && option.optionType !== 'boolean')
                    value = remainingArgs.shift() ?? null;
                parsedOptions.push(parseOption(option, value));
            }
            else if (!isOption(argument)) {
                const arg = this._arguments[argumentCount];
                if (!arg)
                    continue;
                parsedArguments.push(parseArgument(arg, argument));
                argumentCount++;
            }
        }
        for (const element of this._options) {
            const found = parsedOptions.some(a => a.name === element.name);
            if (!found && element.required)
                throw new CommandError(`${element.name} is not provided`);
            if (!found && element.optionType === 'boolean')
                parsedOptions.push({
                    ...element,
                    value: false
                });
        }
        for (const element of this._arguments) {
            const found = parsedArguments.some(a => a.name === element.name);
            if (!found && element.required)
                throw new CommandError(`${element.name} is not provided`);
        }
        const o = parsedOptions
            .map(o => ({ [o.name]: o.value }))
            .reduce((acc, curr) => ({ ...acc, ...curr }), {});
        const a = parsedArguments
            .map(o => ({ [o.name]: o.value }))
            .reduce((acc, curr) => ({ ...acc, ...curr }), {});
        await this._action(o, a);
    }
    _findOption(argument) {
        const { key } = extractKeyValue(argument);
        if (!key)
            return null;
        return (this._options.find(option => {
            return (extractKeyValue(option.flag).key === key ||
                option.alias?.some(alias => extractKeyValue(alias).key === key));
        }) ?? null);
    }
    action(fn) {
        this._action = fn;
        return this;
    }
    get name() {
        return this._commandName;
    }
    get help() {
        return (`${this._commandName} [options] [arguments]\n\n` +
            ` ${this._description ?? 'No description available for this command'}\n\n` +
            ' Options:\n' +
            `${this._options
                .map(o => '   ' +
                o.flag +
                ' ' +
                o.alias?.join(' ') +
                '    ' +
                (o.description
                    ? o.description.toUpperCase()
                    : (o.required ? 'required' : 'optional') + ' ' + o.optionType) +
                '\n')
                .join('')}\n\n` +
            (this._arguments.length > 0 ? ` Arguments:\n` : '') +
            `${this._arguments.map(a => `   <${a.name}>    ${a.description ? a.description.toUpperCase() : (a.required ? ' required' : ' optional') + ' ' + a.type}`).join('\n')}`);
    }
}

class Termify {
    _commands;
    _appName;
    _version;
    constructor({ commands, appName, version }) {
        this._commands = commands;
        this._appName = appName;
        this._version = version;
    }
    /**
     * Starts the CLI by parsing the arguments and executing the corresponding command.
     *
     * @throws {CommandError} If the command name does not exists.
     */
    async start(rawArgs) {
        const args = rawArgs?.split(' ') ?? process.argv.slice(2);
        const commandName = args.shift();
        if (commandName && isHelp(commandName)) {
            console.log(this._getHelp());
            return;
        }
        const command = this._commands.find(c => c.name === commandName);
        if (!command)
            throw new CommandError(`Command name: '${commandName}' does not exists`);
        await command.parseArguments(args);
    }
    _getHelp() {
        return `Usage: ${this._appName} <command> [options] [arguments]\n\nCommands:\n${this._commands.map(c => c.help).join('\n\n\n')}`;
    }
}

export { BaseCommand, CommandError, Termify, extractKeyValue, genCommand, isHelp, isOption, parseArgument, parseOption, parseValueType };
