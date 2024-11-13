export default class CommandError extends Error {
    constructor(message: string) {
        super(message);
    }
}