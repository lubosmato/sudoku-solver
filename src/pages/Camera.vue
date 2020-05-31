<template>
  <div>
    <div class="webcam-wrapper">
      <div class="webcam">
        <video ref="webcam" class="hidden"></video>
        <canvas ref="canvas"></canvas>
      </div>
      <div class="controls">
        <div class="row q-col-gutter-md q-pr-md q-py-md full-width">
          <div class="col-12 col-sm-6">
            <q-btn
              :to="{ name: 'index' }"
              color="negative"
              label="Back"
              icon="keyboard_arrow_left"
              class="full-width"
              :disable="isScanning"
            />
          </div>
          <div class="col-12 col-sm-6">
            <q-btn
              color="primary"
              label="Scan"
              icon-right="center_focus_strong"
              class="full-width"
              @click="scan"
              :loading="isScanning"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from "lodash"
import CvWorker from "workerize-loader!pages/cv.worker.js"
import { createWorker } from "tesseract.js"

export default {
  name: "Camera",
  data() {
    return {
      isReady: false,
      isRunning: false,
      isScanning: false,
      cvWorker: CvWorker(),
    }
  },
  methods: {
    async start() {
      this.$q.loading.show({ message: "Opening computer eyes..." })

      const width = 400
      const height = 400

      const canvas = this.$refs.canvas
      const webcam = this.$refs.webcam

      const ctx = canvas.getContext("2d")

      canvas.setAttribute("width", width)
      canvas.setAttribute("height", height)

      webcam.setAttribute("width", width)
      webcam.setAttribute("height", height)

      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const environmentCamera = devices.find(
          device => device.kind === "videoinput" && device.label.includes("facing back")
        )
        const constraints = {
          video: {
            width: {
              max: width,
            },
            height: {
              max: height,
            },
          },
        }
        if (environmentCamera) {
          constraints.video.deviceId = environmentCamera.deviceId
        } else {
          constraints.facingMode = {
            exact: "environment",
          }
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)

        webcam.srcObject = mediaStream
        webcam.play()

        let sudokuInfo = { corners: [], cells: [], image: null }

        const runProcessing = async () => {
          if (!this.isRunning) {
            mediaStream.getTracks().forEach(track => track.stop())
            return
          }
          ctx.drawImage(webcam, 0, 0, width, height)

          const { corners } = _.cloneDeep(sudokuInfo)
          if (corners.length === 4) {
            ctx.beginPath()
            ctx.strokeStyle = "#ff0000ff"
            ctx.lineWidth = 3
            const drawLine = (p1, p2) => {
              ctx.moveTo(p1.x, p1.y)
              ctx.lineTo(p2.x, p2.y)
            }
            drawLine(corners[0], corners[1])
            drawLine(corners[1], corners[2])
            drawLine(corners[2], corners[3])
            drawLine(corners[3], corners[0])
            ctx.stroke()
          }

          requestAnimationFrame(runProcessing)
        }
        runProcessing()

        const runAnalysis = async () => {
          if (!this.isRunning) return

          if (!this.isReady) {
            this.isReady = await this.cvWorker.isReady()
            if (this.isReady) this.$q.loading.hide()
            requestAnimationFrame(runAnalysis)
            return
          }

          ctx.drawImage(webcam, 0, 0, width, height)
          const imageData = ctx.getImageData(0, 0, width, height)
          sudokuInfo = await this.cvWorker.findSudoku(width, height, new Uint8Array(imageData.data), this.isScanning)

          const { cells, image } = sudokuInfo
          if (cells.length === 9 && this.isScanning) {
            ctx.putImageData(new ImageData(image, width, height), 0, 0)

            this.isRunning = false

            const padding = [6, 6, 6, 6]
            const worker = createWorker()
            ;(async () => {
              await worker.load()
              await worker.loadLanguage("eng")
              await worker.initialize("eng")
              await worker.setParameters({
                tessedit_char_whitelist: "123456789",
              })

              const scannedNumbers = []
              for (let row = 0; row < 9; row++) {
                const scannedRow = []
                for (let col = 0; col < 9; col++) {
                  const { left, top, right, bottom } = cells[row][col]
                  const {
                    data: { text },
                  } = await worker.recognize(canvas, {
                    rectangle: {
                      left: left + padding[3],
                      top: top + padding[0],
                      width: right - left - padding[3] - padding[1],
                      height: bottom - top - padding[0] - padding[2],
                    },
                  })
                  ctx.fillStyle = "#03fc17aa"
                  ctx.fillRect(
                    left + padding[3],
                    top + padding[0],
                    right - left - padding[3] - padding[1],
                    bottom - top - padding[0] - padding[2]
                  )
                  let n = parseInt(text.substr(0, 1))
                  if (isNaN(n)) n = null
                  scannedRow.push({ value: n })
                }
                scannedNumbers.push(scannedRow)
              }
              await worker.terminate()
              this.onScanSuccess(scannedNumbers)
            })()
          }

          if (this.isRunning) requestAnimationFrame(runAnalysis)
        }
        runAnalysis()
      } catch (e) {
        console.error("error:", e)
      }
    },
    scan() {
      this.isScanning = true
    },
    onScanSuccess(numbers) {
      this.$store.commit("sudoku/unlockAll")
      this.$store.commit("sudoku/reset")
      this.$store.commit("sudoku/updateGrid", numbers)
      this.$store.commit("sudoku/lockFilled")
      this.isScanning = false
      this.$router.replace({ name: "index" })
    },
  },
  mounted() {
    this.isRunning = true
    this.isScanning = false
    this.start()
  },
  destroyed() {
    this.isRunning = false
    this.$q.loading.hide()
    this.cvWorker.terminate()
  },
}
</script>

<style lang="scss" scoped>
.webcam-wrapper {
  width: 100vw;
  height: 100vh;

  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr min-content;
  gap: 1px 1px;
  justify-content: center;
  align-items: center;
  align-content: center;

  & > div {
    display: flex;
    align-items: center;
    flex-direction: column;
  }

  canvas {
    max-width: 100vw;
    height: 75vh;
  }
  .button {
    width: 100%;
    min-width: 150px;
    max-width: 500px;
  }
  .controls {
    width: 100%;
  }
}
</style>
