<template>
  <div>
    <div @click="showNumbers" ref="input" :class="{ input: true, invalid: hasError, readonly: isLocked }">
      {{ value }}
    </div>
    <div class="numbers hidden">
      <q-banner>
        <template v-slot:avatar>
          <q-icon name="signal_wifi_off" color="primary" />
        </template>
        You have lost connection to the internet. This app is offline.
      </q-banner>
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
    showNumbers() {
      if (this.isLocked) return
      console.log("Hello")
    },
  },
}
</script>

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
      background: rgb(27, 54, 75);
    }
  }
}
</style>
