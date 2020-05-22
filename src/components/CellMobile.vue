<template>
  <div>
    <div :class="{ input: true, invalid: hasError, readonly: isLocked }">
      {{ value }}
      <q-popup-edit
        :disable="isLocked"
        ref="numbers"
        v-model="isNumbersShown"
        content-class="numbers"
        @before-hide="onNumbersHide"
      >
        <q-btn color="primary" :outline="value !== i" v-for="i in 9" :label="i" :key="i" @click="selectNumber(i)" />
      </q-popup-edit>
    </div>
  </div>
</template>

<script>
export default {
  name: "CellMobile",
  props: {
    position: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      pressedNumber: null,
      isNumbersShown: false,
    }
  },
  computed: {
    cell() {
      return this.$store.getters["sudoku/cell"](this.position.x, this.position.y)
    },
    hasError() {
      return this.cell.hasError
    },
    isLocked() {
      return this.cell.isLocked
    },
    value: {
      get() {
        return this.cell.value
      },
      set(value) {
        this.$store.commit("sudoku/setValue", { ...this.position, value })
      },
    },
  },
  methods: {
    selectNumber(number) {
      this.pressedNumber = number
      this.$refs.numbers.set()
    },
    onNumbersHide() {
      if (this.value === this.pressedNumber) {
        this.value = null
      } else {
        this.value = this.pressedNumber
      }
      this.pressedNumber = null
    },
  },
}
</script>

<style lang="scss">
.numbers {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  grid-column-gap: 0.8em;
  grid-row-gap: 0.8em;

  max-width: initial;
  max-height: initial;
}
</style>

<style lang="scss" scoped>
.input {
  border: none;
  width: 100%;
  height: 100%;

  font-size: 5vmin;
  display: flex;
  align-items: center;
  justify-content: center;

  &.invalid {
    border: 3px solid rgba(255, 0, 0, 0.637);
  }
  &.readonly {
    background: rgb(213, 239, 255);
  }
}

.body--dark {
  .input {
    background: var(--q-color-dark);
    color: white;
    &.invalid {
      border: 3px solid rgb(255, 33, 33);
    }
    &.readonly {
      background: rgb(52, 82, 105);
    }
  }
}
</style>
