import BaseCommand from './Command';
import { CommandError } from './CommandError';

export class Termify<Commands extends Array<BaseCommand<any, any, any>>> {
    private readonly _commands: Commands;

    constructor(commands: Commands) {
        this._commands = commands;
    }

    public async start() {
        const args = process.argv.slice(2);

        const commandName = args.shift();

        const command = this._commands.find(c => c.name === commandName);

        if (!command) throw new CommandError(`Command name: '${commandName}' does not exists`);

        await command.parseArguments(args);
    }
}
