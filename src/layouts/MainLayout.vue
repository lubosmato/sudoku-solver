<template>
  <q-layout view="hHh LpR fFf">
    <q-drawer show-if-above v-model="left" side="left" bordered v-if="$q.platform.is.desktop" :width="325">
      <SudokuControls />
    </q-drawer>

    <q-page-container>
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
