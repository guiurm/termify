import { dts } from "rollup-plugin-dts";

export default [
    {
        input: "build/mjs/main.js",
        output: {
            dir: "dist",
            format: "esm",
            entryFileNames: "main.mjs",
        },
        //plugins: [typescript({ declaration: false, tsconfig: "./tsconfig.json" })],
    },
    {
        input: "build/cjs/main.js",
        output: {
            dir: "dist",
            format: "cjs",
            entryFileNames: "main.cjs",
        },
        //plugins: [typescript({ declaration: false, tsconfig: "./tsconfig-cjs.json" })],
    },
    {
        input: "build/mjs/main.d.ts",
        output: [{ file: "dist/main.d.ts", format: "es" }],
        plugins: [dts()],
    },
];
