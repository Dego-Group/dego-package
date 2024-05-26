export const degoPackageRootPath = process.argv[1]
  .split('\\')
  .slice(0, -4)
  .join('\\')

export enum Color {
  Black = 30,
  Red = 31,
  Green = 32,
  Yellow = 33,
  Blue = 34,
  Magenta = 35,
  Cyan = 36,
  White = 37,
}

export enum BackgroundColor {
  Black = 40,
  Red = 41,
  Green = 42,
  Yellow = 43,
  Blue = 44,
  Magenta = 45,
  Cyan = 46,
  White = 47,
}

export enum Effect {
  Bold = 1,
  Dim = 2,
  Italic = 3,
  Underline = 4,
  Blink = 5,
  Inverse = 7,
  Hidden = 8,
}

type ColorOption = Color | BackgroundColor

export function color(text: string, colorOrOptions: ColorOption): string
export function color(
  text: string,
  colorOrOptions: { color?: ColorOption; effects?: Effect[] }
): string
export function color(
  text: string,
  colorOrOptions: ColorOption | { color?: ColorOption; effects?: Effect[] }
): string {
  const codes: number[] = []
  const resetCode = '\x1b[0m'

  // Handle single ColorOption or options object
  if (
    typeof colorOrOptions === 'string' ||
    typeof colorOrOptions === 'number'
  ) {
    codes.push(colorOrOptions as ColorOption)
  } else if (colorOrOptions) {
    if (colorOrOptions.color) {
      codes.push(colorOrOptions.color)
    }
    if (colorOrOptions.effects) {
      codes.push(...colorOrOptions.effects)
    }
  }

  if (codes.length) {
    return `\n\x1b[${codes.join(';')}m${text}${resetCode}`
  } else {
    return text
  }
}
