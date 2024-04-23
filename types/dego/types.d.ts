import { StoreData } from './hooks/store';
export type DegoFunctionComponent = (props?: Record<string, any>) => DegoComponent;
export type DegoComponent = {
    degoId: DegoId;
    isDegoComponent: true;
    children: DegoComponent[];
} & ({
    rawHtml: RawHtml;
    isNode: false;
} | {
    stringHtml: string;
    isNode: true;
});
export type RawHtml = Element;
export type DegoId = {
    isDegoId: true;
    id: string;
    interactions: {
        id: string;
        callback: (e: any) => void;
    }[];
    storeReferences: {
        id: string;
    }[];
    hooks: {
        degoComponentInvocation: DegoComponentInvocation;
        memory: any[];
        number: number;
        unmountFunctions: Map<string, () => void>;
    };
    childIds: (DegoId | undefined)[] | Map<UniqueChildId, DegoId>[];
    component?: DegoComponent;
    parent: {
        degoId: DegoId;
        atIndex: number;
    } | 'ROOT';
};
export type UniqueChildId = string | number;
export type DegoComponentInvocation<P = Record<string, any> | undefined, PL = Record<string, any> | undefined> = {
    isDegoComponentInvocation: true;
    uniqueChildId: UniqueChildId;
    isPage: boolean;
} & ({
    type: 'async';
    getDegoComponent: (degoId: DegoId) => Promise<DegoComponent>;
    props?: PL;
    loadingInvocation: DegoComponentInvocation;
} | {
    type: 'normal';
    props?: P;
    getDegoComponent: (degoId: DegoId) => DegoComponent;
});
declare global {
    interface Window {
        /**
         * Accessed all over the library to get the current Virtual Dom.
         * */
        degoRootComponent: DegoComponent;
        degoRenderProgress: {
            pendingInteractionIds: Set<{
                id: string;
                p: (e: any) => void;
                lastP: (e: any) => void | undefined;
                onEvent: string;
                wasFocused: boolean;
            }>;
            pendingReferenceIds: Set<{
                id: string;
            } & ({
                type: 'component';
                degoComponent: DegoComponent;
            } | {
                type: 'store';
                data: StoreData<Element | undefined>;
            })>;
        };
        /**
         * Used to track an ID across the invocation to the processing stage.
         * */
        degoCurrentDegoId: DegoId;
        /**
         * Used to mark the current root or the re-rendered component (like the root of a re-render).
         *
         * These are both unified under the term "Top Component".
         * */
        degoCurrentTopComponentId: string | undefined;
        rootElementId: string | undefined;
        degoPageId: DegoId | undefined;
        isNode: boolean;
        nodePath: string;
    }
}
export type DegoConfig = {
    seo?: {
        title?: string;
        description?: string;
    };
};
export type GetAttributes<E extends HTMLElement> = Partial<E>;
