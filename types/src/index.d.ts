#!/usr/bin/env node
export declare interface Configuration {
    srcDir: string;
    pagesDir: string;
    outDir: string;
}
import './dego/timing';
import './dego/types';
import './dego/html';
import './dego/helpers';
import './dego/attributes';
import './dego/components/link';
import './dego/hooks/fetch';
import './dego/hooks/globalStore';
import './dego/hooks/globalValue';
import './dego/hooks/globals';
import './dego/hooks/hook-helper';
import './dego/hooks/render-queue';
import './dego/hooks/store';
import './dego/hooks/value';
import './dego/hooks/watch';
import { render } from './dego/render';
export declare const render2: typeof render;
