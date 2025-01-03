import { Termify } from './Termify';
import { genCommand } from './utils/commandUtils';

export * from './Command';
export * from './CommandError';
export * from './Termify';

export * from './types';
export * from './utils/commandUtils';
export * from './utils/optionUtils';

const c = genCommand({
    name: 'ci',
    options: [
        {
            name: 'port',
            optionType: 'number',
            flag: '-p',
            alias: ['--port'],
            defaultValue: '5173',
            required: false,
            customValidator: n => ({ error: isNaN(Number(n)) })
        },
        {
            name: 'env',
            optionType: 'string',
            flag: '-e',
            alias: ['--env'],
            defaultValue: '',
            required: false,
            customValidator: _ => ({ error: false })
        },
        {
            name: 'ssl',
            flag: '-s',
            optionType: 'boolean',
            alias: ['--ssl']
        }
    ] as const,
    args: [
        { name: 'url', type: 'string', required: true },
        { name: 'token', type: 'string', required: false }
    ] as const
});

c.action((optionsParam, argsP) => {
    console.log(optionsParam);
    console.log(argsP);
});

new Termify([c]).start();
