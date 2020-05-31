import _ from "lodash"

class Sudoku {
  constructor(sudokuSize) {
    this.sudokuSize = sudokuSize
    this.rules = [isNaN, val => val === "", val => val < 1, val => val > 9]

    this.possibleSolutions = []
    this.grid = []
    for (let i = 0; i < sudokuSize; i++) {
      const row = []
      for (let j = 0; j < sudokuSize; j++) {
        row.push({ value: null, isLocked: false, hasError: false })
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
    if (!value) {
      this.grid[cellY][cellX].hasError = false
      return
    }

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

  generate(difficulty) {
    this.unlockAll()
    this.reset()

    this.possibleSolutions = []

    this.generateStep()
    this.updateGrid(this.possibleSolutions[0])
    this.lockFilled()

    const removedCells = Sudoku._shuffleArray([...this])
    const toDeleteCount = (Math.min(10, difficulty) / 10) * 9 * 9
    for (let i = 0; i < toDeleteCount; i++) {
      const { x, y } = removedCells.pop()

      if (!this.grid[y][x].isLocked) continue

      const value = this.grid[y][x].value

      this.grid[y][x].isLocked = false
      this.grid[y][x].value = null

      this.possibleSolutions = []
      this.solveStep()

      if (this.possibleSolutions.length > 1) {
        this.grid[y][x].isLocked = true
        this.grid[y][x].value = value
      }
    }
  }

  generateStep() {
    if (this.possibleSolutions.length > 1) {
      return
    }
    for (let y = 0; y < this.sudokuSize; y++) {
      for (let x = 0; x < this.sudokuSize; x++) {
        if (this.grid[y][x].value === null) {
          const numbers = [...Array(9).keys()].map(n => n + 1)
          const shuffledNumbers = Sudoku._shuffleArray(numbers)
          for (const n of shuffledNumbers) {
            if (this.isPossibleValue(x, y, n)) {
              this.grid[y][x].value = n
              this.generateStep()
              this.grid[y][x].value = null
            }
          }
          return
        }
      }
    }
    this.possibleSolutions.push(_.cloneDeep(this.grid))
  }

  solve() {
    this.possibleSolutions = []

    const hasErrors = this.grid.flat().some(cell => cell.hasError)
    if (!hasErrors) {
      this.solveStep()
    }

    if (this.possibleSolutions.length == 0) {
      throw Error("Bad sudoku... No solution found 😐")
    } else if (this.possibleSolutions.length > 1) {
      throw Error("Puzzle has multiple solutions so it is invalid 😪")
    }
    return this.possibleSolutions[0]
  }

  solveStep() {
    if (this.possibleSolutions.length > 1) {
      return
    }
    for (let y = 0; y < this.sudokuSize; y++) {
      for (let x = 0; x < this.sudokuSize; x++) {
        if (this.grid[y][x].value === null) {
          for (let n = 1; n < 10; n++) {
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
      this.grid[y][x].hasError = false
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

export default Sudoku
