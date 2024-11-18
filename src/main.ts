import CliCommandApp from './CliCommandApp';
import { genCommand } from './utils/commandUtils';

export * from './CliCommandApp';
export { default as CliCommandApp } from './CliCommandApp';
export { default as Command } from './Command';
export * from './CommandError';
export { default as CommandError } from './CommandError';

export * from './types';
export * from './utils/commandUtils';
export * from './utils/optionUtils';

const c = genCommand(
    'ci',
    [
        {
            name: 'port',
            optionType: 'number',
            flag: '-p',
            alias: ['--port'],
            defaultValue: '',
            required: true,
            customValidator: n => n as number
        },
        {
            name: 'env',
            optionType: 'string',
            flag: '-e',
            alias: ['--env'],
            defaultValue: '',
            required: false,
            customValidator: n => n as string
        }
    ] as const,
    [
        { name: 'url', type: 'string', required: true },
        { name: 'token', type: 'string', required: false }
    ] as const
);

c.action(({ options, parsedArgs }, optionsParam, argsP) => {
    console.log(optionsParam);
    console.log(argsP);
});

new CliCommandApp([c]).start();
/*

*/
