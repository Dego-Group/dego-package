import './style.css'

import { DegoComponentInvocation, e, html } from 'dego-package'

import { Header } from './components/header'

export default function Layout({ page }: { page: DegoComponentInvocation }) {
  return html`
    <div>
      ${e(Header)}
      <div class="pageWrapper">${page}</div>
    </div>
  `
}
