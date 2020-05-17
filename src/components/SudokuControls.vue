<template>
  <div class="q-px-md q-ma-none q-gutter-y-md">
    <q-btn-toggle
      v-model="isLocked"
      class="q-ma-none q-mt-md"
      spread
      toggle-color="primary"
      color="white"
      text-color="primary"
      :options="[
        { label: 'Locked', value: true },
        { label: 'Unlocked', value: false },
      ]"
    />
    <q-btn color="red" icon-right="restore" label="Reset" class="full-width" @click="reset" />
    <q-btn color="primary" icon-right="casino" label="Solve" class="full-width" @click="solve" />

    <q-separator />
    <q-item>
      <q-item-section avatar>
        <q-icon :color="`red-${difficulty}`" name="extension" />
      </q-item-section>
      <q-item-section>
        <q-slider v-model="difficulty" :min="1" :max="10" :step="1" snap label color="red" />
      </q-item-section>
    </q-item>
    <q-badge class="q-mt-none" color="red">Difficulty: {{ difficulty }}</q-badge>

    <q-btn color="primary" icon-right="fas fa-random" label="Generate" class="full-width" @click="generate" />

    <q-dialog :value="hasError" transition-show="scale" transition-hide="scale" @hide="acknowledgeError">
      <q-card class="bg-red text-white" style="width: 300px">
        <q-card-section>
          <div class="text-h6">Sudoku error</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          {{ errorMessage }}
        </q-card-section>

        <q-card-actions align="right" class="bg-white text-red">
          <q-btn flat label="OK" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    {{ isWorking }}
  </div>
</template>

<script>
import { createNamespacedHelpers } from "vuex"
const { mapMutations, mapState } = createNamespacedHelpers("sudoku")

// TODO add congratulation animation when successfuly finishing puzzle
// TODO block UI when is working

export default {
  name: "SudokuControls",
  data() {
    return {
      isLocked: false,
      difficulty: 1,
    }
  },
  computed: {
    ...mapState(["errorMessage", "isWorking"]),
    hasError() {
      return this.errorMessage !== ""
    },
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
    ...mapMutations(["reset", "lockFilled", "unlockAll", "acknowledgeError"]),
    solve() {
      this.$store.dispatch("sudoku/solve")
    },
    generate() {
      this.$store.dispatch("sudoku/generate", this.difficulty)
    },
  },
}
</script>

<style></style>
