<template>
  <div class="q-px-md q-pt-md full-height full-width column controls">
    <div class="col q-gutter-y-md">
      <div class="row q-col-gutter-x-md q-mt-md">
        <div class="col-6">
          <q-btn :to="{ name: 'camera' }" color="primary" icon-right="camera" label="Scan" class="full-width" />
        </div>
        <div class="col-6">
          <q-btn color="primary" icon-right="fas fa-random" label="Generate" class="full-width" @click="generate" />
        </div>
      </div>

      <q-slider v-model="difficulty" :min="1" :max="10" :step="1" snap label color="secondary" class="q-mt-sm" dense />
      <q-badge class="q-my-none" color="secondary">Difficulty: {{ difficulty }}</q-badge>

      <q-separator />

      <div class="row q-col-gutter-x-md">
        <div class="col-3">
          <q-btn color="primary" icon="lock" class="full-width" @click="lockFilled" />
        </div>
        <div class="col-3">
          <q-btn color="primary" icon="lock_open" class="full-width" @click="unlockAll" />
        </div>
        <div class="col-6">
          <q-btn color="primary" icon-right="casino" label="Solve" class="full-width" @click="solve" outline />
        </div>
      </div>

      <div class="row q-col-gutter-x-md">
        <div class="col-3">
          <q-btn color="primary" icon-right="get_app" class="full-width" @click="download" />
        </div>
        <div class="col-3">
          <q-btn color="primary" icon-right="print" class="full-width" @click="print" />
        </div>
        <div class="col-3">
          <q-btn color="secondary" icon="share" @click="share" class="full-width" />

          <q-tooltip
            anchor="top left"
            :value="isCopiedShown"
            content-style="font-size: 1em"
            transition-show="scale"
            transition-hide="scale"
            no-parent-event
          >
            Copied to clipboard
          </q-tooltip>
        </div>
        <div class="col-3">
          <q-btn color="negative" icon-right="restore" class="full-width" @click="reset" />
        </div>
      </div>

      <q-dialog :value="hasError" transition-show="scale" transition-hide="scale" @hide="acknowledgeError">
        <q-card class="bg-secondary text-white" style="width: 300px">
          <q-card-section>
            <div class="text-h6">Sudoku error</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            {{ errorMessage }}
          </q-card-section>

          <q-card-actions align="right" class="bg-white text-secondary">
            <q-btn flat label="OK" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog :value="isWorking" persistent transition-show="scale" transition-hide="scale">
        <q-card class="bg-primary text-white" style="width: 300px">
          <q-card-section>
            <div class="text-h6"><div class="loading">Calculating</div></div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            {{ workingMessage }}
          </q-card-section>

          <q-card-actions align="right" class="bg-white text-primary">
            <q-btn flat label="Cancel" @click="stop" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
    <div class="text-caption author col-1 desktop-only">
      Made with ❤️ and Quasar <a href="https://github.com/lubosmato/sudoku-solver" target="_blank">source</a>
    </div>
  </div>
</template>

<script>
import html2canvas from "html2canvas"
import { createNamespacedHelpers } from "vuex"
const { mapMutations, mapState } = createNamespacedHelpers("sudoku")

const emojis = [
  "😄",
  "😃",
  "😀",
  "😊",
  "😉",
  "😍",
  "😚",
  "😗",
  "😙",
  "😜",
  "😝",
  "😛",
  "😳",
  "😁",
  "😔",
  "😌",
  "😒",
  "😞",
  "😣",
  "😢",
  "😂",
  "😭",
  "😪",
  "😥",
  "😰",
  "😅",
  "😓",
  "😩",
  "😫",
  "😨",
  "😱",
  "😆",
  "😋",
  "😷",
  "😎",
  "😴",
  "😵",
  "😲",
  "😟",
  "😦",
  "😧",
  "😈",
  "👿",
  "😮",
  "😬",
  "😐",
  "😕",
  "😯",
  "😶",
  "😇",
  "😏",
  "😑",
  "👍",
  "👌",
  "👊",
  "✊",
  "✌",
  "👋",
  "✋",
  "👈",
  "🙏",
  "☝",
  "👏",
  "💪",
]

function randomEmoji() {
  return emojis[Math.floor(Math.random() * emojis.length)]
}

const sudokuFacts = [
  "Sudoku is based on an early mathematical analysis concept designed in 1782",
  "the very first Sudoku World Championships were hosted in 2006 in Italy",
  "several celebrities have admitted to being addicted to Sudoku",
  "the Guinness World Record for the fastest time to complete a Sudoku is less than 1 minute and a half",
  "in the year following Sudoku going viral, pencil sales are said to have increased by around 700%",
  "the name “Sudoku” can be broken down into “Su” which means “Number” and “Doku” which means “Single/Only.”",
  "the New York Time crossword editor psecondaryicted that the Sudoku mania wouldn’t last; he was wrong",
  "while a Sudoku puzzle can have more than one solution, a well-formed puzzle has just one unique solution",
  "JavaScript is not very fast language and this app is written in JavaScript",
]

function randomFact() {
  return sudokuFacts[Math.floor(Math.random() * sudokuFacts.length)]
}

export default {
  name: "SudokuControls",
  data() {
    return {
      isCopiedShown: false,
      difficulty: 3,
      workingMessage: "",
    }
  },
  computed: {
    ...mapState(["errorMessage", "isWorking"]),
    hasError() {
      return this.errorMessage !== ""
    },
  },
  watch: {
    isWorking(val) {
      if (val) {
        const emoji = randomEmoji()
        const message = randomFact()
        this.workingMessage = `Did you know that ${message}? ${emoji}`
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
    stop() {
      this.$store.dispatch("sudoku/stop")
    },
    async share() {
      const exportedSudoku = this.$store.getters["sudoku/exported"]
      const publicPath = "sudoku/" // TODO get publicPath from quasar.conf.js somehow
      let url = ""
      if (this.$router.options.mode === "hash") {
        url = `${window.location.origin}/${publicPath}#/sudoku/${exportedSudoku}`
      } else {
        url = `${window.location.origin}/${publicPath}sudoku/${exportedSudoku}`
      }

      const navigatorShare = () => {
        const data = {
          title: "Check out this Sudoku! 🙂",
          text: "Check out this Sudoku! 🙂",
          url,
        }
        if (navigator.canShare !== undefined && !navigator.canShare(data)) throw new Error("Cannot share")
        navigator.share(data)
      }

      if (this.$q.platform.is.mobile) {
        try {
          await navigatorShare()
          // eslint-disable-next-line no-empty
        } catch {}
      } else {
        try {
          await navigator.clipboard.writeText(url)
          this.isCopiedShown = true
          setTimeout(() => {
            this.isCopiedShown = false
          }, 2000)
        } catch {
          this.$store.commit("sudoku/updateError", "Something went wrong 😥")
        }
      }
    },
    async download() {
      const saveAs = (uri, filename) => {
        const link = document.createElement("a")

        if (typeof link.download === "string") {
          link.href = uri
          link.download = filename

          //Firefox requires the link to be in the body
          document.body.appendChild(link)

          //simulate click
          link.click()

          //remove the link when done
          document.body.removeChild(link)
        } else {
          window.open(uri)
        }
      }
      const canvas = await html2canvas(document.querySelector(".main-grid"))
      saveAs(canvas.toDataURL(), "sudoku.png")
    },
    print() {
      window.print()
    },
  },
}
</script>

<style lang="scss" scoped>
.author {
  height: 2em;
}
.loading:after {
  overflow: hidden;
  display: inline-block;
  vertical-align: bottom;
  -webkit-animation: ellipsis steps(4, end) 900ms infinite;
  animation: ellipsis steps(4, end) 900ms infinite;
  content: "\2026"; /* ascii code for the ellipsis character */
  width: 0px;
}

@keyframes ellipsis {
  to {
    width: 20px;
  }
}

@-webkit-keyframes ellipsis {
  to {
    width: 20px;
  }
}
</style>
