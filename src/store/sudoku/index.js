import _ from "lodash"
import Sudoku from "./sudoku.js"
import SudokuWorker from "workerize-loader!./sudoku.worker.js"

let worker = SudokuWorker()

export default {
  namespaced: true,
  getters: {
    cell(state) {
      return (x, y) => state.grid.cell(x, y)
    },
    exported(state) {
      const gridValues = [...state.grid].map(({ cell }) => {
        if (cell.value === null) return " "
        return cell.value.toString()
      })
      const exported = btoa(gridValues.reduce((sum, c) => sum + c))
      return exported
    },
    hasFinishedWithoutHelp(state) {
      const isNotCompleted = state.grid.grid.flat().some(cell => cell.hasError || cell.value === null)
      if (!isNotCompleted && !state.wasHelped) {
        return true
      }
      return false
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
    reset(state) {
      state.grid.reset()
    },
    setWorking(state, isWorking) {
      state.isWorking = isWorking
    },
    updateError(state, errorMessage) {
      state.errorMessage = errorMessage
    },
    updateGrid(state, grid) {
      state.grid.updateGrid(grid)
    },
    acknowledgeError(state) {
      state.errorMessage = ""
    },
    setWasHelped(state, wasHelped) {
      state.wasHelped = wasHelped
    },
  },
  actions: {
    async solve({ state, commit }) {
      commit("setWasHelped", true)
      try {
        commit("setWorking", true)
        const clonedGrid = _.cloneDeep(state.grid.grid)
        const solution = await worker.solve(clonedGrid)
        commit("updateGrid", solution)
      } catch (e) {
        commit("updateError", e.message)
      } finally {
        commit("setWorking", false)
      }
    },
    async generate({ state, commit }, difficulty) {
      commit("unlockAll")
      commit("reset")
      commit("setWasHelped", false)
      try {
        commit("setWorking", true)
        const clonedGrid = _.cloneDeep(state.grid.grid)
        const newGrid = await worker.generate(clonedGrid, difficulty)
        commit("updateGrid", newGrid)
        commit("unlockAll")
        commit("lockFilled")
      } catch (e) {
        commit("updateError", e.message)
      } finally {
        commit("setWorking", false)
      }
    },
    async import({ commit, dispatch }, sudoku) {
      commit("setWasHelped", false)
      try {
        const rawGrid = atob(sudoku)
        const flatGrid = [...rawGrid].map(c => {
          const isInputWrong = c.match(/[^\d ]/g)
          if (isInputWrong) {
            throw new Error()
          }
          if (c === " ") {
            return { value: null }
          } else {
            return { value: parseInt(c) }
          }
        })
        const grid = []
        for (let y = 0; y < 9; y++) {
          grid.push(flatGrid.splice(0, 9))
        }
        commit("updateGrid", grid)
        commit("lockFilled")
        await dispatch("solve")
        commit("reset")
      } catch {
        commit("updateError", "Could not load sudoku 😥")
      }
    },
    async stop({ commit }) {
      commit("setWorking", false)
      worker.terminate()
      worker = SudokuWorker()
    },
  },
  state: {
    grid: new Sudoku(9),
    errorMessage: "",
    isWorking: false,
    wasHelped: false,
  },
}
