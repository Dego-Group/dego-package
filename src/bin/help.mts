import { EXPECTED_COMMANDS, OPTIONS } from './index.mjs'

export function getHelp() {
  let longestLength = 0
  for (const { command } of EXPECTED_COMMANDS) {
    if (longestLength < command.length) {
      longestLength = command.length
    }
  }

  for (const option of Object.keys(OPTIONS)) {
    const length = `--${option}`.length
    if (longestLength < length) {
      longestLength = length
    }
  }

  function addSpaces(command: string) {
    const spacesNeeded = longestLength - command.length

    const spaces = (new Array(spacesNeeded) as ' '[]).fill(
      ' ',
      0,
      spacesNeeded + 1
    )
    return command + spaces.join('')
  }

  return (
    `Flags:\n${Object.entries(OPTIONS)
      .map(([key, value]) => `${addSpaces(`--${key}`)} -> ${value.description}`)
      .join('\n')}` +
    '\n\n' +
    `Commands:\n${EXPECTED_COMMANDS.map(
      ({ command, explanation }) => `${addSpaces(command)} -> ${explanation}`
    ).join('\n')}`
  )
}
