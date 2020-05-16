<template>
  <div class="q-mx-md q-mt-xs q-gutter-md">
    <q-btn-toggle
      v-model="isLocked"
      class="q-ma-none q-mt-md"
      spread
      toggle-color="green"
      color="white"
      text-color="green"
      :options="[
        { label: 'Locked', value: true },
        { label: 'Unlocked', value: false },
      ]"
    />
    <q-btn color="red" icon-right="restore" label="Reset" class="full-width" @click="reset" />
    <q-btn color="primary" icon-right="casino" label="Solve" class="full-width" @click="solve" />

    <q-separator />

    <q-btn color="primary" icon-right="fas fa-random" label="Generate" class="full-width" @click="generate" />
  </div>
</template>

<script>
import { createNamespacedHelpers } from "vuex"
const { mapMutations } = createNamespacedHelpers("sudoku")

export default {
  name: "SudokuControls",
  data() {
    return {
      isLocked: true,
    }
  },
  watch: {
    isLocked(val) {
      if (val) {
        this.lockFilled()
      } else {
        this.unlockAll()
      }
    },
  },
  methods: {
    ...mapMutations(["reset", "solve", "generate", "lockFilled", "unlockAll"]),
  },
}
</script>

<style></style>
