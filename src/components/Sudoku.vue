<template>
  <div class="square">
    <div class="main-grid">
      <Cell
        class="cell"
        :position="{ x, y }"
        :test="cell"
        v-for="{ x, y, cell } in numbers"
        :key="`${x}-${y}`"
        @move="move"
        :ref="`cell_${x}_${y}`"
      />
    </div>
  </div>
</template>

<script>
import Cell from "components/Cell.vue"
import { mapState } from "vuex"

export default {
  name: "Sudoku",
  components: { Cell },
  computed: {
    ...mapState("sudoku", ["numbers"]),
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
}
</script>

<style lang="scss">
.square {
  position: relative;
  width: 100vmin;

  &:after {
    content: "";
    display: block;
    padding-bottom: 100%;
  }

  .main-grid {
    $border-color: rgb(196, 196, 196);

    position: absolute;
    width: 100%;
    height: 100%;

    border: 1px solid $border-color;

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
