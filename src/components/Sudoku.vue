<template>
  <div class="main-page wrap full-width row">
    <div class="square col-12 col-sm-8 col-md-12 col-lg-12 q-pa-md">
      <div class="main-grid" v-if="$q.platform.is.mobile">
        <CellMobile class="cell" :position="{ x, y }" v-for="{ x, y } in grid" :key="`${x}-${y}`" />
      </div>
      <div class="main-grid" v-else>
        <Cell
          class="cell"
          :position="{ x, y }"
          v-for="{ x, y } in grid"
          :key="`${x}-${y}`"
          @move="move"
          :ref="`cell_${x}_${y}`"
        />
      </div>
    </div>
    <div v-if="$q.platform.is.mobile" class="col-12 col-sm-4 col-md-12 col-lg-12 self-end">
      <SudokuControls />
    </div>
    <Congratulation ref="congratulation" />
  </div>
</template>

<script>
import Congratulation from "components/Congratulation.vue"
import CellMobile from "components/CellMobile.vue"
import Cell from "components/Cell.vue"
import SudokuControls from "components/SudokuControls.vue"
import { mapState, mapGetters } from "vuex"

export default {
  name: "Sudoku",
  components: { CellMobile, Cell, SudokuControls, Congratulation },
  props: {
    sudoku: {
      type: String,
      default: "",
    },
  },
  computed: {
    ...mapState("sudoku", ["grid"]),
    ...mapGetters("sudoku", ["hasFinishedWithoutHelp"]),
  },
  watch: {
    hasFinishedWithoutHelp(val) {
      if (val) {
        this.$refs.congratulation.show()
      }
    },
  },
  methods: {
    move({ where, currentPosition }) {
      const newPosition = { ...currentPosition }

      if (where == "up") newPosition.y--
      else if (where === "right") newPosition.x++
      else if (where === "down") newPosition.y++
      else if (where === "left") newPosition.x--

      const cellToFocusRef = `cell_${newPosition.x}_${newPosition.y}`
      if (!(cellToFocusRef in this.$refs)) return

      const cellToFocus = this.$refs[cellToFocusRef][0]
      cellToFocus.focus()
    },
  },
  mounted() {
    if (this.sudoku) {
      this.$store.dispatch("sudoku/import", this.sudoku)
      this.$router.replace({ name: "index" })
    } else {
      try {
        this.$store.commit("sudoku/loadState")
      } catch {
        this.$store.dispatch("sudoku/generate", 3)
      }
    }
  },
}
</script>

<style lang="scss">
@media print {
  html,
  body {
    height: 100%;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden;
    background: white !important;
  }
  .q-drawer-container {
    display: none;
  }
  .q-page-container {
    padding-left: 0 !important;
  }
  .square {
    width: 100vmin !important;
    height: 100vmin !important;
  }
  body .controls {
    display: none;
  }
  .cell {
    border-color: black !important;
  }
  .input,
  .input.readonly,
  .input:read-only {
    background: white !important;
    color: black !important;
  }
}

.main-page {
  height: 100vh;
  max-height: 100vh;
}
body.screen--lg,
body.screen--xl {
  .square {
    width: 100vmin;
    height: 100vmin;
  }
}
.square {
  .main-grid {
    $border-color: rgb(37, 37, 37);

    width: 100%;
    height: 100%;

    display: grid;
    grid-template-columns: repeat(9, 1fr);
    grid-template-rows: repeat(9, 1fr);
    grid-column-gap: 0px;
    grid-row-gap: 0px;
    grid-auto-flow: row;

    & > .cell {
      border: 1px solid $border-color;
      &:nth-child(3n) {
        border-right: 4px solid $border-color;
      }
      &:nth-child(9n) {
        border: 1px solid $border-color;
      }

      &:nth-child(n + 19):nth-child(-n + 27) {
        border-bottom: 4px solid $border-color;
      }
      &:nth-child(n + 46):nth-child(-n + 54) {
        border-bottom: 4px solid $border-color;
      }
    }
  }
}

.body--dark {
  .main-grid {
    $border-color: rgb(212, 212, 212);

    & > .cell {
      border: 1px solid $border-color;
      &:nth-child(3n) {
        border-right: 4px solid $border-color;
      }
      &:nth-child(9n) {
        border: 1px solid $border-color;
      }

      &:nth-child(n + 19):nth-child(-n + 27) {
        border-bottom: 4px solid $border-color;
      }
      &:nth-child(n + 46):nth-child(-n + 54) {
        border-bottom: 4px solid $border-color;
      }
    }
  }
}
</style>
