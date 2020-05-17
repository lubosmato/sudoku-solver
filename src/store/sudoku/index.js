import _ from "lodash"
import Sudoku from "./sudoku.js"
import Worker from "workerize-loader!./worker.js"

const worker = new Worker()

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
  },
  actions: {
    async solve({ state, commit }) {
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
  },
  state: {
    grid: new Sudoku(9),
    errorMessage: "",
    isWorking: false,
  },
}
