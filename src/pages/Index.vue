<template>
  <q-page class="flex">
    <Sudoku :sudoku="$route.params.sudoku" />
  </q-page>
</template>

<script>
import Sudoku from "components/Sudoku.vue"

export default {
  name: "PageIndex",
  components: { Sudoku },
}
</script>
