import { Link, e, html } from 'dego-package'

import { wrapper } from './style.module.css'

export function Header() {
  const nav: { name: string; link: string }[] = [
    { name: 'Home', link: '/' },
    { name: 'About', link: '/about' },
  ]

  return html`
    <header class=${wrapper}>
      <p>Dego</p>
      <nav>
        ${nav.map(({ name, link }, i) =>
          e(
            Link,
            {
              content: name,
              href: link,
            },
            i
          )
        )}
      </nav>
    </header>
  `
}
