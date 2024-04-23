import { GlobalContext } from './globals';
export declare function useGlobalValue<V extends Record<string, any>, R extends Record<string, any>>(globalContext: GlobalContext<V, R>): [GlobalGetter<V>, GlobalSetter<V>];
export type GlobalGetter<V> = <T extends keyof V>(id: T) => V[T];
export type GlobalSetter<V> = <T extends keyof V>(id: T, data: V[T]) => void;
