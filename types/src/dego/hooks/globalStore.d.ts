import { GlobalContext } from './globals';
import { StoreData } from './store';
export declare function useGlobalStore<V extends Record<string, any>, R extends Record<string, any>>(globalContext: GlobalContext<V, R>): GlobalStoreGetter<R>;
export type GlobalStoreGetter<V> = <T extends keyof V>(id: T) => StoreData<V[T]>;
