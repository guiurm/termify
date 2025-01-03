import { BaseCommand } from './Command';
import { CommandError } from './CommandError';
import { isHelp } from './main';

export class Termify<Commands extends Array<BaseCommand<any, any, any>>> {
    private readonly _commands: Commands;
    private readonly _appName: string;
    private readonly _version: string;

    constructor({ commands, appName, version }: { commands: Commands; appName: string; version: string }) {
        this._commands = commands;
        this._appName = appName;
        this._version = version;
    }

    /**
     * Starts the CLI by parsing the arguments and executing the corresponding command.
     *
     * @throws {CommandError} If the command name does not exists.
     */
    public async start(rawArgs?: string) {
        const args = rawArgs?.split(' ') ?? process.argv.slice(2);

        const commandName = args.shift();

        if (commandName && isHelp(commandName)) {
            console.log(this._getHelp());
            return;
        }

        const command = this._commands.find(c => c.name === commandName);

        if (!command) throw new CommandError(`Command name: '${commandName}' does not exists`);

        await command.parseArguments(args);
    }

    private _getHelp() {
        return `Usage: ${this._appName} <command> [options] [arguments]\n\nCommands:\n${this._commands.map(c => c.help).join('\n\n\n')}`;
    }
}
