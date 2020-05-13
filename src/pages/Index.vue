<template>
  <q-page class="flex flex-center">
    <Sudoku />
  </q-page>
</template>

<script>
import Sudoku from "components/Sudoku.vue"

export default {
  name: "PageIndex",
  components: { Sudoku },
}
</script>
