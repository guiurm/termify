import typescript from "@rollup/plugin-typescript";

export default [
    {
        input: "src/main.ts",
        output: {
            dir: "dist/mjs",
            format: "esm",
            entryFileNames: "main.mjs",
        },
        plugins: [typescript({ tsconfig: "./tsconfig.json" })],
    },
    {
        input: "dist/mjs/main.mjs",
        output: {
            dir: "dist/cjs",
            format: "cjs",
            entryFileNames: "main.cjs",
        },
        plugins: [typescript({ tsconfig: "./tsconfig-cjs.json" })],
    },
];
