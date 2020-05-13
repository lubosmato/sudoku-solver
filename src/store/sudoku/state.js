class SudokuData {
  constructor(sudokuSize) {
    this.sudokuSize = sudokuSize
    this.numbers = []
    this.rules = [isNaN, val => val === "", val => val < 1, val => val > 9]

    for (let i = 0; i < sudokuSize; i++) {
      const row = []
      for (let j = 0; j < sudokuSize; j++) {
        row.push({ value: 1, isFrozen: false, hasError: false })
      }
      this.numbers.push(row)
    }
  }

  setCell(x, y, value) {
    this.numbers[y][x].hasError = this.rules.some(rule => rule(value))
    this.numbers[y][x].value = value
  }

  cell(x, y) {
    return this.numbers[y][x]
  }

  *[Symbol.iterator]() {
    for (let y = 0; y < this.sudokuSize; y++) {
      for (let x = 0; x < this.sudokuSize; x++) {
        yield { x, y, cell: this.numbers[y][x] }
      }
    }
  }

  generateNumber() {
    return Math.floor(Math.random() * this.sudokuSize) + 1
  }

  makeStep() {
    let y = 0
    const numbers = [...Array(this.sudokuSize).keys()].map(n => n + 1)
    const shuffledNumbers = SudokuData._shuffleArray(numbers)

    for (let x = 0; x < this.sudokuSize; x++) {
      this.setCell(x, y, shuffledNumbers[x])
    }
  }

  static _shuffleArray(array) {
    for (let i = 0; i < array.length; i++) {
      const newIndex = Math.floor(Math.random() * array.length)
      const swapped = array[i]
      array[i] = array[newIndex]
      array[newIndex] = swapped
    }
    return array
  }
}

export default function() {
  return {
    numbers: new SudokuData(9),
    isLoading: false,
  }
}
