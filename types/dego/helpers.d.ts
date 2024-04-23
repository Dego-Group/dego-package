import { DegoComponent, DegoComponentInvocation, DegoId } from './types';
export declare function createSingleString(h: string[], stringParams: string[]): string;
export declare function createElementFromHTML(htmlString: string): Element;
export declare function escapeHTML(str: string): string;
export declare function cuid(length?: number): string;
export declare function runUnmountFunctions(degoId: DegoId): void;
export declare function setupSubRender(degoId: DegoId): () => void;
export declare function replaceComponent(oldComponent: DegoComponent, newComponentInvocation: DegoComponentInvocation, newComponentId: DegoId, opts?: {
    considerUnmount?: boolean;
}): void;
export declare function getChanged(oldE: Element, newE: Element, depth?: number): ChangeResult[] | false;
type ChangeResult = {
    new: Element;
    old: Element;
    depth: number;
};
export {};
