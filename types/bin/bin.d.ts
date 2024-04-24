#!/usr/bin/env node
export declare const EXPECTED_COMMANDS: readonly [{
    readonly command: "dev";
    readonly explanation: "Run dev server, exposes a dev server port and auto refreshes your browser for you.";
}, {
    readonly command: "version";
    readonly explanation: "Gets the current version of Dego and compares it to your local version.";
}, {
    readonly command: "build";
    readonly explanation: "Builds Dego based on your `dego.config.js` file.";
}];
export declare const OPTIONS: {
    readonly config: {
        readonly type: "string";
        readonly description: "Path to Dego config file, relative to the current working directory.";
    };
    readonly help: {
        readonly type: "boolean";
        readonly default: false;
        readonly description: "Shows all valid commands and flags along with their uses.";
    };
};
export declare const argv: {
    [x: string]: unknown;
    readonly config: string | undefined;
    readonly help: boolean;
    _: (string | number)[];
    $0: string;
};
