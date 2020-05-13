<template>
  <div class="q-mx-md q-mt-xs q-gutter-md">
    <q-btn color="red" icon-right="restore" label="Reset" class="full-width" @click="reset" />
    <q-btn color="primary" icon-right="arrow_right_alt" label="Make step" class="full-width" @click="makeStep" />

    <q-btn color="primary" icon-right="casino" label="Generate new" class="full-width" @click="generateNew" />
  </div>
</template>

<script>
export default {
  name: "SudokuControls",
  data() {
    return {}
  },
  methods: {
    reset() {
      this.$store.commit("sudoku/RESET")
    },
    generateNew() {
      this.$store.commit("sudoku/GENERATE_RANDOM", 10)
    },
    makeStep() {
      this.$store.commit("sudoku/MAKE_STEP")
    },
  },
}
</script>

<style></style>
