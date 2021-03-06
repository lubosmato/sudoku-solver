import _ from "lodash"
import Sudoku from "./sudoku.js"
import SudokuWorker from "workerize-loader!./sudoku.worker.js"

let worker = SudokuWorker()

function saveState(grid) {
  localStorage.setItem("sudoku", JSON.stringify(grid))
}

export default {
  namespaced: true,
  getters: {
    cell(state) {
      return (x, y) => state.grid.cell(x, y)
    },
    exported(state) {
      const gridValues = [...state.grid].map(({ cell }) => {
        if (!cell.isLocked || cell.value === null) return " "
        return cell.value.toString()
      })
      const exported = btoa(gridValues.reduce((sum, c) => sum + c))
      return exported
    },
    isCompleted(state) {
      return state.grid.isCompleted()
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
      saveState(state.grid.grid)
    },
    lockFilled(state) {
      state.grid.lockFilled()
      saveState(state.grid.grid)
    },
    unlockAll(state) {
      state.grid.unlockAll()
      saveState(state.grid.grid)
    },
    reset(state) {
      state.grid.reset()
      saveState(state.grid.grid)
    },
    setWorking(state, isWorking) {
      state.isWorking = isWorking
    },
    updateError(state, errorMessage) {
      state.errorMessage = errorMessage
    },
    updateGrid(state, grid) {
      state.grid.updateGrid(grid, false)
      saveState(state.grid.grid)
    },
    loadState(state) {
      const lastGrid = JSON.parse(localStorage.getItem("sudoku"))
      if (!lastGrid) throw new Error()

      state.grid.updateGrid(lastGrid, true)
      state.wasHelped = state.grid.isCompleted()
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
    async import({ commit, dispatch, state }, sudoku) {
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
        commit("unlockAll")
        commit("reset")
        commit("updateGrid", grid)
        commit("lockFilled")
        await dispatch("solve")
        commit("reset")
        commit("setWasHelped", state.grid.isCompleted())
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
