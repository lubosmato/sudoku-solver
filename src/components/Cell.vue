<template>
  <div>
    <input
      type="text"
      ref="input"
      v-model.number="value"
      :class="{ input: true, invalid: hasError }"
      :readonly="isLocked"
      @focus="focus"
      @keydown="onKeyDown"
    />
  </div>
</template>

<script>
export default {
  name: "Cell",
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
    onKeyDown(event) {
      const { keyCode, key } = event
      const keyCodeToMoveName = {
        38: "up",
        39: "right",
        40: "down",
        37: "left",
      }

      if (!(keyCode in keyCodeToMoveName)) {
        if (key !== "Tab") {
          setTimeout(() => this.$refs.input.select(), 0)
        }
        return
      }

      const moveName = keyCodeToMoveName[keyCode]
      this.$emit("move", { where: moveName, currentPosition: this.position })
      event.preventDefault()
    },
    focus() {
      this.$refs.input.select()
    },
  },
}
</script>

<style lang="scss" scoped>
.input {
  border: none;
  width: 100%;
  height: 100%;
  font-size: 6vmin;
  text-align: justify;
  text-align-last: center;
  &.invalid {
    border: 3px solid lighten($negative, 20);
    outline: 3px solid lighten($negative, 20);
  }
  &:read-only {
    user-select: none;
    background: lighten($primary, 45);
  }
}

.body--dark {
  .input {
    background: var(--q-color-dark);
    color: white;
    &.invalid {
      border: 3px solid lighten($negative, 5);
      outline: 1px solid lighten($negative, 5);
    }
    &:read-only {
      background: darken($primary, 22);
    }
  }
}
</style>
