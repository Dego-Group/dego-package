const functionsToRun: ToRun[] = []

type ToRun = { mode: Mode; on: On; func: () => void }

function handleFunctions(v: boolean, on: On, f: ToRun[]) {
  // Do not run end functions if beginning, this is where 'renderBegin' logic would go if needed
  if (v) return

  for (let i = 0; i < f.length; i++) {
    const toRun = f[i]

    if (toRun.on !== on) continue

    switch (toRun.mode) {
      case 'once': {
        toRun.func()
        f.splice(i, 1)
        i--
        break
      }
      case 'everyTime': {
        toRun.func()
        break
      }
    }
  }
}

// In order that they occur
export const timing = {
  corePass: {
    onGoing: true,
    setOngoing(v: boolean) {
      this.onGoing = v
      handleFunctions(v, 'corePassEnd', functionsToRun)
    },
  },
  assignmentPass: {
    onGoing: true,
    setOngoing(v: boolean) {
      this.onGoing = v
      handleFunctions(v, 'assignmentPassEnd', functionsToRun)
    },
  },
  interactionPass: {
    onGoing: true,
    setOngoing(v: boolean) {
      this.onGoing = v
      handleFunctions(v, 'interactionPassEnd', functionsToRun)
    },
  },
  rendering: {
    onGoing: true,
    setOngoing(v: boolean) {
      this.onGoing = v
      handleFunctions(v, 'renderingEnd', functionsToRun)
    },
  },
}

export function run(mode: Mode, on: On, func: () => void) {
  functionsToRun.push({ func, mode, on })
}

type ModifiedUnion<T> = T extends T
  ? keyof T extends string
    ? `${keyof T}End`
    : never
  : never

type Mode = 'everyTime' | 'once'
type On = ModifiedUnion<typeof timing>
