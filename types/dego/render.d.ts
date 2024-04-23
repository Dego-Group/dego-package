import { DegoComponent, DegoComponentInvocation, DegoConfig, DegoId } from './types';
export declare function getPageJS(route: string): Promise<{
    default: () => DegoComponent;
    config?: DegoConfig;
} | undefined>;
export declare function replacePage(pageExport: {
    default: () => DegoComponent;
    config?: DegoConfig;
}): void;
/**
 * Used to render Dego.JS to the DOM, it automatically initiates hooks, re-renders, and more.
 *
 * __Should__ be awaited with a top-level await.
 **/
export declare function render(rootElementId: string, layout: (props: {
    page: DegoComponentInvocation;
}) => DegoComponent): Promise<undefined>;
export declare function reRender(degoId: DegoId): void;
