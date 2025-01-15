'use strict';

var __createBinding = (undefined && undefined.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (undefined && undefined.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Command.js"), exports);
__exportStar(require("./CommandError.js"), exports);
__exportStar(require("./Termify.js"), exports);
__exportStar(require("./types/index.js"), exports);
__exportStar(require("./utils/commandUtils.js"), exports);
__exportStar(require("./utils/optionUtils.js"), exports);
/*const c = genCommand({
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

const d = genCommand({
    name: 'dev',
    options: [
        {
            name: 'port',
            optionType: 'number',
            flag: '-p',
            alias: ['--port'],
            defaultValue: '5173',
            required: false,
            customValidator: n => ({ error: isNaN(Number(n)) })
        }
    ],
    args: []
});

new Termify({ appName: 'myapp', version: '1.0.0', commands: [c, d] }).start('ci --help');*/
