export declare function useValue<T>(defaultValue?: T): [T, Setter<T>];
export type Setter<T> = (newValue: T) => T;
