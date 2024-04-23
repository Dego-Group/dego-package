import { DegoComponent, DegoComponentInvocation, DegoId, UniqueChildId } from './types';
import { StoreData } from './hooks/store';
export declare function html(h: TemplateStringsArray, ...params: (boolean | DegoComponentInvocation | string | number | undefined | null | ((e: any) => any) | DegoComponentInvocation[] | StoreData<Element | undefined>)[]): DegoComponent;
/**
 * Component Invoker *(__e__ for element)*
 *
 * @param degoFunctionComponent
 * Pass a function that returns a `DegoComponent` (do not call the function)
 *
 * @param props
 * Takes in props object if it exists
 *
 * @param uniqueChildId
 * __Required for components in arrays__, a unique child ID key, defaults to `DEFAULT`.
 **/
export declare function e<P extends Record<string, any>>(degoFunctionComponent: (props: P) => DegoComponent, props: P, uniqueChildId?: UniqueChildId): DegoComponentInvocation<P>;
export declare function e(degoFunctionComponent: () => DegoComponent, uniqueChildId?: UniqueChildId): DegoComponentInvocation;
export declare function generateDegoId(degoComponentInvocation: DegoComponentInvocation, parent: {
    degoId: DegoId;
    atIndex: number;
} | 'ROOT'): DegoId;
