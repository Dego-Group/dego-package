import { DegoId } from '../types';
import { StoreData } from './store';
type R = Record<string, any>;
/**
 * Creates a context that can then be passed into both `useGlobalValue` and `useGlobalStore`.
 *
 * You can create multiple contexts, and use them with different hooks.
 *
 * > __Note:__ It is __not__ recommended to use this class's functions directly, you should let `useGlobalValue` and `useGlobalStore` handle the state for you unless you know what you are doing.
 */
export declare class GlobalContext<V extends R = R, S extends R = R, K extends keyof S = keyof S> {
    values: V;
    stores: Record<K, StoreData<S[K]>>;
    componentsUsingValue: Map<keyof V, Set<DegoId>>;
    constructor(defaultValues?: V, defaultStores?: S);
    createValueSubscription<T extends keyof V>(action: T, degoId: DegoId): void;
    setValue<T extends keyof V>(id: T, data: V[T]): void;
    getValue<T extends keyof V>(id: T): V[T];
    getStore<T extends K>(id: T): StoreData<S[T]>;
}
export {};
