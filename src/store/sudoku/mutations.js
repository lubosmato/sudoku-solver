export function SET_VALUE(state, { x, y, value }) {
  state.numbers.setCell(x, y, value)
}

export function GENERATE_RANDOM(state, complexity) {
  complexity
  for (const { x, y } of state.numbers) {
    state.numbers.setCell(x, y, state.numbers.generateNumber())
  }
}

export function RESET(state) {
  for (const { x, y } of state.numbers) {
    state.numbers.setCell(x, y, null)
  }
}

export function MAKE_STEP(state) {
  state.numbers.makeStep()
}
