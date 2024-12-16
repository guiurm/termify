import typescript from "@rollup/plugin-typescript";
import { dts } from "rollup-plugin-dts";

export default [
    {
        input: "src/main.ts",
        output: {
            dir: "dist/mjs",
            format: "esm",
            entryFileNames: "main.mjs",
        },
        plugins: [typescript({ declaration: false, tsconfig: "./tsconfig.json" })],
    },
    {
        input: "dist/mjs/main.mjs",
        output: {
            dir: "dist/cjs",
            format: "cjs",
            entryFileNames: "main.cjs",
        },
        plugins: [typescript({ declaration: false, tsconfig: "./tsconfig-cjs.json" })],
    },
    {
        input: "./src/main.ts",
        output: [{ file: "dist/types/main.d.ts", format: "es" }],
        plugins: [dts()],
    },
];
