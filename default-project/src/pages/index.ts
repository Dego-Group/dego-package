import {
  column,
  heartContainer,
  heartIcon,
  hearts,
  wrapper,
} from './style.module.css'
import { e, html, useValue, useWatch } from 'dego-package'

const EMOJI = '💖'
const LS_KEY = 'hearts'
export default function Index() {
  const [numberOfHearts, setNumberOfHearts] = useValue<number | undefined>(
    undefined
  )

  // Save the heart state to local storage
  useWatch(
    () => {
      if (numberOfHearts === undefined) {
        const number = Number.parseInt(localStorage.getItem(LS_KEY) ?? '0')

        if (Number.isInteger(number)) {
          setNumberOfHearts(number)
        } else {
          setNumberOfHearts(0)
        }
      } else {
        localStorage.setItem(LS_KEY, numberOfHearts.toString())
      }
    },
    [numberOfHearts],
    true
  )

  return html`<div class=${wrapper}>
    <div>
      <h1>Welcome to Dego</h1>
      <p>The all-in-one framework of the future 🚀</p>
    </div>

    <div class=${hearts}>
      <h3>How many hearts can you give?</h3>
      <p>Click the heart bellow to give hearts to Dego.</p>
      <button
        class=${heartIcon}
        onclick=${() => setNumberOfHearts((numberOfHearts ?? 0) + 1)}
      >
        ${EMOJI}
      </button>

      ${e(HeartHolder, { hearts: numberOfHearts ?? 0 })}
    </div>
  </div>`
}

function HeartHolder({ hearts }: { hearts: number }) {
  if (hearts === 0) return html`<p>No hearts yet 😔</p>`

  const heartsPerColumn = 10

  const fullRow = new Array(heartsPerColumn).fill(undefined)

  const columns = new Array(Math.ceil(hearts / heartsPerColumn)).fill(fullRow)

  const remainder = hearts % heartsPerColumn

  if (remainder !== 0)
    columns[columns.length - 1] = new Array(remainder).fill(undefined)

  return html`<div class=${heartContainer}>
    ${columns.map(arr =>
      e(
        () =>
          html`<div class=${column}>
            ${arr.map(() => e(() => html`<p>${EMOJI}</p>`))}
          </div>`
      )
    )}
  </div>`
}
