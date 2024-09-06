import { e, html } from 'dego-package'

import { rationalSection } from './style.module.css'

export default function About() {
  const rational: [string, string][] = [
    // Dego vs. React Comparison - Feature 1: Syntax
    [
      'Dego uses only officially supported ECMA syntax, ensuring compatibility with future JavaScript versions. It avoids JSX or proprietary technologies that could potentially break.',
      'React uses JSX, an unofficial syntax extension for JavaScript. While convenient, future JavaScript changes might cause conflicts with JSX, leading to unintended breaking changes.',
    ],

    // Dego vs. React Comparison - Feature 2: Multi-Page Support
    [
      'Dego is an all-in-one package with built-in features for client-side routing, SSG, hydration, multi-page support, and more. This delivers incredible load times, SEO benefits, and dynamic loading without extra configuration or libraries.',
      "React itself doesn't natively support multiple pages. You'll need additional libraries or frameworks like Next.js to achieve multi-page functionality. React's reliance on runtime UI generation can negatively impact SEO.",
    ],

    // Dego vs. React Comparison - Feature 3: Build Dependencies
    [
      'Dego boasts zero build dependencies. The Dego team maintains complete control over the code shipped to users, resulting in smaller bundle sizes and potentially faster hydration times.',
      "React utilizes third-party dependencies. Frameworks like Next.js used for matching Dego's functionality introduce additional dependencies, increasing bundle size.",
    ],

    // Dego vs. React Comparison - Feature 4: Load Times
    [
      'Dego excels in load times, achieving speeds like 48ms for initial content rendering. This is due to pre-generating HTML at build time and using hydration for interactivity. Dego employs various optimization techniques for consistent performance across devices and network conditions.',
      "React lacks a comparable feature. It relies on the user's device for rapid loading because JS on the client generates all HTML. React also sends substantial JavaScript on initial load, which Dego avoids.",
    ],

    // Dego vs. React Comparison - Feature 5: Developer Experience (Boilerplate Code)
    [
      'Dego minimizes boilerplate code to streamline developer workflow. It offers clean, concise syntax for common tasks.',
      'Many React features have specific usage requirements, potentially leading to excessive boilerplate code.',
    ],

    // Dego vs. React Comparison - Feature 6: State Management
    [
      'Dego incorporates built-in, user-friendly mechanisms for global state management and other core functionalities, eliminating the need for external libraries and simplifying project setup.',
      'React requires additional, often complex third-party libraries to handle global state management and other essential features, adding to the learning curve.',
    ],
  ]

  return html`<div>
    <h1>About Dego</h1>
    <p>
      Dego is a <span style="color: var(--dego-blue)">zero</span> dependency,
      all-in-one framework. It was built to be blazingly fast. The framework
      includes custom features such as a specialized web server, client-side
      routing, hydration, and more.
    </p>

    <br />

    <h2>Why Dego? Why not React?</h2>

    <div class=${rationalSection}>
      ${rational.map(([dego, react]) =>
        e(
          () =>
            html`<div>
              <div>${dego}</div>
              <div>${react}</div>
            </div>`
        )
      )}
    </div>
  </div>`
}
