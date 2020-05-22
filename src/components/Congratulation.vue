<template>
  <q-dialog v-model="isShown" persistent transition-show="scale" transition-hide="scale">
    <q-card class="bg-primary text-white">
      <q-card-section>
        <div v-if="$q.platform.is.mobile" class="text-h4 q-ma-sm congratulations">Congratulations!!!</div>
        <div v-else class="text-h2 q-ma-sm congratulations">Congratulations!!!</div>
      </q-card-section>

      <q-card-section class="q-pt-none text-h5 text-center congratulations">
        🎈🎉 You solved this sudoku! 🥳🎈

        <svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.1" width="2000">
          <g id="rectangles">
            <rect
              v-for="({ x, y, width, height, color, animationDelay, animationDuration }, index) in rectangles"
              :key="index"
              :style="{ fill: color, 'animation-delay': animationDelay, 'animation-duration': animationDuration }"
              class="rectangle"
              :width="width"
              :height="height"
              :x="x"
              :y="y"
            />
          </g>
        </svg>
      </q-card-section>

      <q-card-actions align="right" class="bg-white text-primary">
        <q-btn flat label="Close" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import chroma from "chroma-js"

export default {
  name: "Congratulation",
  data() {
    const rectangles = []
    const rectanglesCount = 150
    const random = (min, max) => Math.random() * (max - min) + min
    let x = 0
    for (let i = 0; i < rectanglesCount; i++) {
      rectangles.push({
        x,
        y: -100,
        width: random(5, 40),
        height: random(5, 40),
        color: chroma.random(),
        animationDelay: `${random(-4, 4)}s`,
        animationDuration: `${random(3, 6)}s`,
      })
      x += random(0, 30)
      if (x > this.$q.screen.width) break
    }
    return {
      rectangles,
      isShown: false,
    }
  },
  methods: {
    playFanfare() {
      const audio = new Audio("/statics/fanfare.mp3")
      audio.play()
    },
    show() {
      this.playFanfare()
      this.isShown = true
    },
  },
}
</script>

<style lang="scss" scoped>
svg {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
}
@keyframes confetti-fall {
  0% {
    transform: translate(0, 0px) rotate3d(1, 1, 1, 0deg);
  }
  100% {
    transform: translate(0, 2000px) rotate3d(1, 1, 1, 1080deg);
  }
}
rect {
  transform-origin: 50% 50%;
  transform-box: fill-box;
  animation: confetti-fall 1s linear infinite;
}

.congratulations {
  font-family: "Balsamiq Sans";
}
</style>
