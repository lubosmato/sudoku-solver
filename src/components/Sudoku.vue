<template>
  <div class="square">
    <div class="main-grid">
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
</template>

<script>
import Cell from "components/Cell.vue"
import { mapState } from "vuex"

export default {
  name: "Sudoku",
  components: { Cell },
  computed: {
    ...mapState("sudoku", ["grid"]),
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
  $spacing: 3vh;
  margin: $spacing;
  width: calc(100vmin - #{$spacing * 2});
  height: calc(100vmin - #{$spacing * 2});

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
</style>
