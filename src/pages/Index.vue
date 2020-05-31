<template>
  <q-page class="flex">
    <Sudoku :sudoku="$route.params.sudoku" />

    <q-dialog v-model="isInstallDialogShown" seamless position="bottom" square>
      <q-card>
        <q-card class="bg-primary text-white">
          <q-card-section class="row items-center no-wrap">
            <div>
              <div class="text-weight-bold">Add Sudoku to desktop</div>
              <div class="">Solve sudoku also offline</div>
            </div>
            <q-space />
            <div class="q-gutter-sm q-ml-sm">
              <q-btn label="Later" color="white" small flat no-caps v-close-popup />
              <q-btn label="Add" text-color="primary" color="white" small v-close-popup @click="confirmInstallation" />
            </div>
          </q-card-section>
        </q-card>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import Sudoku from "components/Sudoku.vue"

export default {
  name: "PageIndex",
  components: { Sudoku },
  data() {
    return {
      isInstalled: window.matchMedia("(display-mode: standalone)").matches,
      installPrompt: null,
      isInstallDialogShown: false,
    }
  },
  methods: {
    confirmInstallation() {
      this.installPrompt.prompt()
    },
  },
  created() {
    if (!this.$q.platform.is.mobile || this.isInstalled) return
    window.addEventListener("beforeinstallprompt", e => {
      e.preventDefault()
      this.installPrompt = e
      this.isInstallDialogShown = true
    })
  },
}
</script>
