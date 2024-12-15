# **Termify**

A TypeScript library for building command-line interfaces (CLI) with ease.

## **Overview**

Termify is a lightweight and flexible library for building command-line interfaces in TypeScript. It provides a simple and intuitive API for defining commands, options, and arguments, making it easy to create robust and maintainable CLI applications.

## **Features**

-   **Easy command definition**: Define commands with a simple and intuitive API.
-   **Flexible option handling**: Support for various option types, including strings, numbers, booleans, and more.
-   **Argument parsing**: Automatically parse command arguments and provide them to your command action.
-   **Custom validation**: Define custom validation logic for options and arguments.
-   **Type safety**: Take advantage of TypeScript's type safety features to ensure your CLI application is robust and maintainable.

## **Getting Started**

To get started with Termify, install the package using npm or yarn:

```bash
npm install @guiurm/termify
```

Then, import the **genCommand** function and define your command:

```typescript
import { genCommand } from "@guiurm/termify";

const command = genCommand("my-command", options, arguments);
```

## **Defining Options**

Options are defined using an array of objects, where each object represents an option. The following properties are supported:

-   **name**: The name of the option.
-   **optionType**: The type of the option (e.g. string, number, boolean).
-   **flag**: The flag for the option (e.g. -f, --foo).
-   **alias**: An array of aliases for the option.
-   **defaultValue**: The default value for the option.
-   **required**: Whether the option is required.
-   **customValidator**: A custom validation function for the option.

**Defining Arguments**
Arguments are defined using an array of objects, where each object represents an argument. The following properties are supported:

-   **name**: The name of the argument.
-   **type**: The type of the argument (e.g. string, number).
-   **required**: Whether the argument is required.

**Example**
Here is an example of a simple CLI application using Termify:

```typescript
import { genCommand } from "@guiurm/termify";

const options = [
    {
        name: "port",
        optionType: "number",
        flag: "-p",
        alias: ["--port"],
        defaultValue: 8080,
        required: true,
    },
];

const arguments = [{ name: "url", type: "string", required: true }];

const command = genCommand("my-command", options, arguments);

command.action((options, args) => {
    console.log(`Starting server on port ${options.port} with URL ${args.url}`);
});

command();
```

This example defines a command called **my-command** with a single option **port** and a single argument **url**. The command action logs a message to the console with the parsed option and argument values.
