import _ from "lodash"

class SudokuData {
  constructor(sudokuSize) {
    this.sudokuSize = sudokuSize
    this.rules = [isNaN, val => val === "", val => val < 1, val => val > 9]

    this.possibleSolutions = []
    this.grid = []
    for (let i = 0; i < sudokuSize; i++) {
      const row = []
      for (let j = 0; j < sudokuSize; j++) {
        row.push({ value: null, isLocked: false, hasError: true })
      }
      this.grid.push(row)
    }
  }

  setCell(x, y, value) {
    const hasError = this.rules.some(rule => rule(value))
    if (hasError) value = null
    this.grid[y][x].hasError = hasError
    this.grid[y][x].value = value
    this.updateErrors()
  }

  lockFilled() {
    for (const { x, y, cell } of this) {
      if (cell.value) {
        this.grid[y][x].isLocked = true
      }
    }
  }

  unlockAll() {
    for (const { x, y } of this) {
      this.grid[y][x].isLocked = false
    }
  }

  updateErrors() {
    this.resetErrors()

    for (let y = 0; y < this.sudokuSize; y++) {
      for (let x = 0; x < this.sudokuSize; x++) {
        this.updateError(x, y)
      }
    }
  }

  resetErrors() {
    for (const { x, y } of this) {
      const value = this.grid[y][x].value
      this.grid[y][x].hasError = this.rules.some(rule => rule(value))
    }
  }

  updateError(cellX, cellY) {
    const value = this.grid[cellY][cellX].value
    if (!value) return

    const getValuesWithoutThisCell = generator => [...generator].filter(v => !(v.x === cellX && v.y === cellY))

    const columnValues = getValuesWithoutThisCell(this.column(cellX))
    const rowValues = getValuesWithoutThisCell(this.row(cellY))
    const blockValues = getValuesWithoutThisCell(this.block(cellX, cellY))

    let errorCount = 0
    ;[columnValues, rowValues, blockValues].flat().forEach(({ x, y, cell }) => {
      const hasError = cell.value === value
      this.grid[y][x].hasError |= hasError
    })
    errorCount
    // this.grid[cellY][cellX].hasError = errorCount !== 0
  }

  cell(x, y) {
    return this.grid[y][x]
  }

  *[Symbol.iterator]() {
    for (let y = 0; y < this.sudokuSize; y++) {
      for (let x = 0; x < this.sudokuSize; x++) {
        yield { x, y, cell: this.grid[y][x] }
      }
    }
  }

  *column(x) {
    for (let y = 0; y < this.sudokuSize; y++) {
      const cell = this.grid[y][x]
      if (cell.value !== null) yield { x, y, cell }
    }
  }

  *row(y) {
    for (let x = 0; x < this.sudokuSize; x++) {
      const cell = this.grid[y][x]
      if (cell.value !== null) yield { x, y, cell }
    }
  }

  *block(x, y) {
    const blockSize = 3
    const blockStart = { x: Math.floor(x / blockSize) * blockSize, y: Math.floor(y / blockSize) * blockSize }
    for (let yOffset = 0; yOffset < blockSize; yOffset++) {
      for (let xOffset = 0; xOffset < blockSize; xOffset++) {
        let x = blockStart.x + xOffset
        let y = blockStart.y + yOffset
        const cell = this.grid[y][x]
        if (cell.value !== null) yield { x, y, cell }
      }
    }
  }

  generateNumber() {
    return Math.floor(Math.random() * this.sudokuSize) + 1
  }

  solve() {
    this.possibleSolutions = []

    this.solveStep()

    if (this.possibleSolutions.length == 0) {
      console.error("No solution")
    } else if (this.possibleSolutions.length > 1) {
      this.updateGrid(this.possibleSolutions[0])
      console.error("Sudoku has multiple solutions")
      console.log("First solution:", this.possibleSolutions[0])
    } else {
      this.updateGrid(this.possibleSolutions[0])
      console.log("Solution:", this.possibleSolutions[0])
    }
  }

  solveStep() {
    if (this.possibleSolutions.length > 1) {
      return
    }
    for (let y = 0; y < this.sudokuSize; y++) {
      for (let x = 0; x < this.sudokuSize; x++) {
        if (this.grid[y][x].value === null) {
          // TODO solving does not need shuffled array - separate this into two features:
          // TODO 1. solver, 2. generator (which needs shuffled array)
          const numbers = [...Array(9).keys()].map(n => n + 1)
          const shuffledNumbers = SudokuData._shuffleArray(numbers)
          for (const n of shuffledNumbers) {
            if (this.isPossibleValue(x, y, n)) {
              this.grid[y][x].value = n
              this.solveStep()
              this.grid[y][x].value = null
            }
          }
          return
        }
      }
    }
    this.possibleSolutions.push(_.cloneDeep(this.grid))
  }

  updateGrid(newGrid) {
    for (const { x, y } of this) {
      this.grid[y][x].value = newGrid[y][x].value
    }
    this.updateErrors()
  }

  isPossibleValue(x, y, value) {
    const getValuesWithoutThisCell = generator =>
      [...generator].filter(v => !(v.x === x && v.y === y)).map(v => v.cell.value)

    const columnValues = getValuesWithoutThisCell(this.column(x))
    const rowValues = getValuesWithoutThisCell(this.row(y))
    const blockValues = getValuesWithoutThisCell(this.block(x, y))

    return ![columnValues, rowValues, blockValues].flat().includes(value)
  }

  reset() {
    for (const { x, y } of this) {
      if (this.grid[y][x].isLocked) continue
      this.grid[y][x].value = null
      this.grid[y][x].hasError = true
    }
  }

  static _shuffleArray(array) {
    const shuffled = [...array]

    for (let i = 0; i < shuffled.length; i++) {
      const newIndex = Math.floor(Math.random() * shuffled.length)
      const swapped = shuffled[i]
      shuffled[i] = shuffled[newIndex]
      shuffled[newIndex] = swapped
    }
    return shuffled
  }
}

export default {
  namespaced: true,
  getters: {
    cell(state) {
      return (x, y) => state.grid.cell(x, y)
    },
  },
  mutations: {
    setValue(state, { x, y, value }) {
      state.grid.setCell(x, y, value)
    },
    lockFilled(state) {
      state.grid.lockFilled()
    },
    unlockAll(state) {
      state.grid.unlockAll()
    },
    generate(state, complexity) {
      // TODO add support for complexity
      complexity
      state.grid.unlockAll()
      state.grid.reset()
      state.grid.solve()
    },
    reset(state) {
      state.grid.reset()
    },
    solve(state) {
      state.grid.solve()
    },
  },
  actions: {},
  state: {
    grid: new SudokuData(9),
    isLoading: false,
  },
}
