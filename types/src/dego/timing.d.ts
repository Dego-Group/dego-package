export declare const timing: {
    corePass: {
        onGoing: boolean;
        setOngoing(v: boolean): void;
    };
    assignmentPass: {
        onGoing: boolean;
        setOngoing(v: boolean): void;
    };
    interactionPass: {
        onGoing: boolean;
        setOngoing(v: boolean): void;
    };
    rendering: {
        onGoing: boolean;
        setOngoing(v: boolean): void;
    };
};
export declare function run(mode: Mode, on: On, func: () => void): void;
type ModifiedUnion<T> = T extends T ? keyof T extends string ? `${keyof T}End` : never : never;
type Mode = 'everyTime' | 'once';
type On = ModifiedUnion<typeof timing>;
export {};
