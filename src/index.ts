#!/usr/bin/env node

import { Command } from 'commander';

const program = new Command();

// Descripción de la aplicación
program.version('1.0.0').description('Una aplicación CLI simple en Node.js con TypeScript');

// Comando 'saludar' con una opción 'nombre'
program
    .command('saludar')

    .description('Saluda al usuario')
    .option('-n, --nombre <nombre>', 'Nombre del usuario', 'Mundo')
    .action((cmd: { nombre: string }) => {
        console.log(`¡Hola, ${cmd.nombre}!`);
    });

// Comando 'suma' con dos opciones numéricas
program
    .command('suma')
    .description('Suma dos números')
    .option('-a, --numero1 <num>', 'Primer número', parseFloat)
    .option('-b, --numero2 <num>', 'Segundo número', parseFloat)
    .action((cmd: { numero1: number; numero2: number }) => {
        const suma = cmd.numero1 + cmd.numero2;
        console.log(`El resultado de la suma es: ${suma}`);
    });

// Parsear los argumentos y ejecutar los comandos
program.parse(process.argv);
