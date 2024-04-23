export declare class StoreData<T> {
    value: T;
    constructor(value: T);
}
export declare function useStore<T>(defaultValue?: T): {
    value: T;
};
