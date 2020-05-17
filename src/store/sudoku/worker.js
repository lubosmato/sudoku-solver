import Sudoku from "./sudoku.js"

export async function solve(grid) {
  const sudoku = createSudoku(grid)
  return sudoku.solve()
}

export async function generate(grid, difficulty) {
  const sudoku = createSudoku(grid)
  sudoku.generate(difficulty)
  return sudoku.grid
}

function createSudoku(grid) {
  const sudoku = new Sudoku(9)
  sudoku.updateGrid(grid)
  return sudoku
}
