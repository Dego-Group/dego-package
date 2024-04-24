import { Configuration } from '..';
export declare const DEFAULT_CONFIG: {
    srcDir: string;
    pagesDir: string;
    outDir: string;
};
export declare function getConfig(configPath?: string): Configuration;
