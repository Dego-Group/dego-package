type Result<T> = {
    status: 'waiting';
    fetch: () => void;
} | {
    status: 'finished';
    data: T;
    refetch: () => void;
} | {
    status: 'loading';
    cancel: () => void;
} | {
    status: 'error';
    error: any;
    refetch: () => void;
    errorCode: number;
};
export declare function useFetch<T>(url: string, init?: RequestInit, fetchOnMount?: boolean): Result<T>;
export {};
