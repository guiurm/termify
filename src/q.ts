import * as fs from 'fs';
import * as path from 'path';

// Clase que emula el comportamiento de Commander
class CliFrw {
    private commands: { [key: string]: Function } = {};
    private options: { [key: string]: string } = {};
    private currentCommand: string = '';
    private currentOptions: string[] = [];

    constructor() {
        this.commands['help'] = this.showHelp.bind(this);
    }

    // Registrar comandos
    command(name: string, description: string, action: Function) {
        this.commands[name] = action;
        console.log(`Comando ${name}: ${description}`);
        return this;
    }

    // Registrar opciones
    option(flag: string, description: string) {
        this.options[flag] = description;
        return this;
    }

    // Definir el comando a ejecutar
    parse(args: string[]) {
        const command = args[0] || '';
        this.currentCommand = command;

        // Si el primer argumento es un comando válido
        if (this.commands[command]) {
            this.commands[command](args.slice(1));
        } else {
            this.showHelp();
        }
    }

    // Mostrar ayuda
    private showHelp() {
        console.log('Ayuda:');
        for (const command in this.commands) {
            console.log(`  ${command}`);
        }

        for (const option in this.options) {
            console.log(`  ${option}: ${this.options[option]}`);
        }
    }
}

// Instanciar el "Commander"
const program = new CliFrw();

// Registrar un comando
program
    .command('saludar', 'Saluda al usuario', (args: string[]) => {
        const nombre = args[0] || 'Mundo';
        console.log(`¡Hola, ${nombre}!`);
    })
    .command('leer', 'Lee el contenido de un archivo', (args: string[]) => {
        const filePath = args[0];
        if (filePath) {
            fs.readFile(path.resolve(filePath), 'utf8', (err, data) => {
                if (err) {
                    console.error('Error leyendo el archivo:', err.message);
                } else {
                    console.log(data);
                }
            });
        } else {
            console.log('Debe proporcionar la ruta del archivo.');
        }
    })
    .command('version', 'Muestra la versión del programa', () => {
        console.log('Versión: 1.0.0');
    });

// Registrar una opción global
program.option('--verbose', 'Muestra más detalles en la salida');

// Parsear los argumentos
const args = process.argv.slice(2);
program.parse(args);
