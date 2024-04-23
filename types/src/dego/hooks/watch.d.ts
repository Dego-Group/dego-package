/**
 * @param callback
 * Runs once when it detects a change in the `deps` array during a re-render.
 *
 * __Note:__ Only checks for changes on a re-render, this means some other hook must trigger a re-render for this code to run.
 *
 * @param deps
 * An array that can take in many values and any type. Dego.JS uses [`Object.is()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) to check equality, which checks by reference on some types.
 *
 * If `deps` isn't included it will run on mount by default.
 */
export declare function useWatch<T extends any[]>(callback: (prevValues: T, newValues: T) => void | (() => void)): undefined;
export declare function useWatch<T extends any[]>(callback: (prevValues: T, newValues: T) => void | (() => void), deps: Readonly<T>, runOnMount?: boolean): undefined;
