import { DegoId } from '../types';
export declare class HookHelper<T> {
    degoId: DegoId;
    hookNumber: number;
    constructor();
    addUnmountFunction(func: () => void, id?: string): string;
    removeUnmountFunction(id: string): void;
    requestReRender(): void;
    setMemory(data: T): void;
    getMemory(validator?: (data: T) => boolean): T;
}
