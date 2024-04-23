# Dego.JS Notes

Dego.JS Alpha

## Todo Before V1:

- [x] Remove need to pass in Dego Id into HTML
- [x] Ensure complex arrays work with state system (make a todo list app)
- [x] Preform a diff to only update the DOM where needed
- [x] Prevent XSS attacks
- [x] Render Dego Components to the DOM
- [x] Test custom hooks
- [x] Folder-based routing using `layout.ts` as the wrapper
  - [x] Client-side routing
  - [x] Support for per-page SEO (example: per-page title)
  - [x] Hydration: Static site rendering for all pages then the JS is downloaded for every link on the page
    - [x] Support for page loading skeleton code (`loading.ts`)
    - [x] Minified SSG generated HTML
- [x] Async Dego Component support, with loading skeletons
- [x] [Hooks](#hooks)
  - [x] Switch hook memory, put it into the `DegoId` object

## Bugs:

- [x] Cannot have multiple instances of the same component in the same parent
  - [x] Fix `uniqueChildId` not tracking during render
- [x] Components with state cannot have children with state on the very first render
- [x] Child components do not keep their DegoIds between re-renders, causing `useValue` data loss
- [x] Memory of all components no longer apart of the `rootDegoComponent` hogs up memory for no reason
- [x] Interaction elements (elements with a on\_\_ event) get re-rendered for no reason
- [x] Render queue does not consider branching component tree
- [x] Elements get unfocused each re-render
- [x] `useValue` reverts to old (the last render) state sometimes, no clue why. It happens specially when adding, editing or removing things from the demo todo list.
- [x] Render queue needs to check if the parent has already been queued, and if so, do no re-render it.
- [x] CSS module outside of route doesn't get included
- [x] You need to run `pnpm build` with every change, it should be apart of `pnpm dev`
- [x] `useGlobalValue` re-renders regardless if the component is actually reading the value, should be dependent on if the component gets the value or not to prevent re-renders.
- [x] Cannot use comments in HTML
- [x] (I have considered this not important, so it isn't fixed, just no worth fixing.) When client-side routing it does not update the meta-date
- [x] Cannot go back or forward <- -> ([`popstate event`](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState#parameters))

## Future Todo

- [x] The `useGlobalStore` hook
- [x] Allow navigation from a Dego ID to a Dego Component in the code. Then remove ID children.
- [x] Put CSS inline in HTML so it does not need to do a request after initial page load
- [ ] Memoize child components and only preform a re-render if the props change. Cannot really do this until `useMemo` is a thing.
- [ ] When client-side routing it does not update the meta-date
- [ ] The `useLayoutWatch` hook
- [ ] The `useMemo` hook (will be like React's `useMemo` and `useCallback` hooks combined)
- [ ] Minify Dego HTML in `app.bundle.js`
- [ ] Dynamic urls (using Deno as web server?)
- [ ] Hook for easily using URL params

## Development Docs

### Hooks

| Done             | Hook Name        | Description                                                                                                                                    |
| ---------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Reactive**     |                  |                                                                                                                                                |
| ✅               | `useValue`       | Tracks local values across renders and is reactive/triggers re-renders upon a change                                                           |
| ✅               | `useGlobalValue` | Tracks values across the entire app and is reactive/triggers re-renders upon a change                                                          |
| **Stores**       |                  |                                                                                                                                                |
| ✅               | `useStore`       | Allows you to locally store and edit values without triggering a re-render, this can be used to reference HTML elements directly               |
| ✅               | `useGlobalStore` | Tracks values across the entire app without triggering a re-render                                                                             |
| **Side Effects** |                  |                                                                                                                                                |
| ✅               | `useWatch`       | Detects changes based on an array of values, does not trigger re-renders but runs upon a re-render                                             |
| ❌               | `useLayoutWatch` | Similar to `useWatch` but runs after rendering has complete                                                                                    |
| **Other**        |                  |                                                                                                                                                |
| ✅               | `useFetch`       | Intelligently handles fetches for you.                                                                                                         |
| ❌               | `useMemo`        | Holds values or functions between renders, improving preference. Take in a deps array, so it can automatically recalculate when values change. |

### Timing System

**Timing Loop**

> **Note:** Setting `onGoing` to true marks the start of that time step

> **Todo:** Move where the `onGoing` is set to actually mark the start of that time step

1.  Starts the `corePass` time step

    1. Calls the invocation of the first component, this triggers it and all child components to run

       > **Note:** We will be tracking a singular component's execution, keep in mind that this is a recursive loop, and will therefore happen once per component invocation

       1. Calls hooks if there are any

          **`useValue` hook**

          1. Sets up the setter function, loads component's default value into memory, if it is a re-render it will fetch the value from memory
          2. If the setter function is called, it queues a re-render
             > **Note:** It "queue"s up a re-render by waiting for the end of the [event loop (mdn)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop#event_loop) before re-rendering that component

       2. Processes the HTML
          > **Note:** We will be tracking a singular variable in the HTML, this is a loop, and will therefore happen once per variable
          - If it is a boolean
            1. Ignore it, treat as an empty string, this is to make conditional HTML easier
          - If it is a Dego Id
            > **Note:** This is getting removed soon, so I am not writing the docs for it
          - If it is another Dego Component
            1. Start again at **Timing Loop** 1.1
            2. Take the returned HTML of that Dego Component, stringify it
            3. Queue up a reference attachment to run after `assignmentPass`, this will ensure all Dego Components have the correct reference to the correct HTML
            4. Return the stringified HTML
          - If it is a function
            1. Check for an `onevent` before the function
            2. Queue an event listener to attach once `assignmentPass` completes
            3. Return an empty string
          - If it is a string or number
            1. Stringify it, escape HTML, return it
       3. Ends the `corePass` time step

2.  Once the `corePass` step ends, start the `assignmentPass` time step
    1. Run through everything queued for the `assignmentPass`
