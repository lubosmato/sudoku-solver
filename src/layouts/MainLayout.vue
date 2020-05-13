<template>
  <q-layout view="hHh LpR fFf">
    <q-drawer show-if-above v-model="left" side="left" bordered>
      <SudokuControls />
    </q-drawer>

    <q-page-container class="full-height">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import SudokuControls from "components/SudokuControls.vue"

export default {
  components: { SudokuControls },
  data() {
    return {
      left: true,
    }
  },
}
</script>
