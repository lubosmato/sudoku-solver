<template>
  <q-page class="q-pa-md full-height">
    <q-btn label="Start" color="primary" @click="start" />
    <q-slider v-model="canny1" :min="1" :step="1" :max="1000" />
    <q-badge :label="`Canny1: ${canny1}`" />
    <q-slider v-model="canny2" :min="0" :step="1" :max="1000" />
    <q-badge :label="`Canny2: ${canny2}`" />
    <br />
    <div class="webcam-wrapper">
      <video ref="webcam" class="hidden"></video>
      <canvas ref="canvas"></canvas>
    </div>
  </q-page>
</template>

<script>
import cv from "opencv.js-webassembly"

export default {
  name: "Camera",
  data() {
    return {
      // canny1: 98,
      // canny2: 17,
      canny1: 38,
      canny2: 78,
    }
  },
  methods: {
    async start() {
      const width = 400
      const height = 400

      const canvas = this.$refs.canvas
      const webcam = this.$refs.webcam

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

        const vc = new cv.VideoCapture(webcam)
        const src = new cv.Mat(height, width, cv.CV_8UC4)

        const houghThresh = 100

        const sortByRho = (a, b) => (a.rho - b.rho > 0 ? 1 : -1)

        const dilateKernel = cv.Mat.ones(3, 3, cv.CV_8U)
        const erodeKernel = cv.Mat.ones(5, 5, cv.CV_8U)

        const processImage = () => {
          let img = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC1)
          cv.cvtColor(src, img, cv.COLOR_RGBA2GRAY, 0)
          cv.Canny(img, img, this.canny1, this.canny2, 3)
          cv.dilate(img, img, dilateKernel)
          cv.erode(img, img, erodeKernel)

          let houghLines = new cv.Mat()
          cv.HoughLines(img, houghLines, 1, Math.PI / 180 / 2, houghThresh, 0, 0, 0, Math.PI)
          img.delete()

          const lines = Array.from({ length: Math.ceil(houghLines.rows / 2) }, (v, i) =>
            houghLines.data32F.slice(i * 2, i * 2 + 2)
          ).map(line => {
            return { rho: line[0], theta: line[1] }
          })
          houghLines.delete()

          const lineSize = width * 1.42
          const angleTolerance = 0.3

          const horizontalLines = lines
            .filter(line => Math.abs(line.theta - Math.PI / 2) < angleTolerance)
            .sort(sortByRho)

          const verticalLines = lines
            .map(line => {
              // normalize negative rho
              if (line.rho < 0) {
                line.theta -= Math.PI
                line.rho = -line.rho
              }
              return line
            })
            .filter(line => Math.abs(line.theta) < angleTolerance)
            .sort(sortByRho)

          const filterLines = linesToFilter => {
            const averaged = []
            for (let i = 0; i < linesToFilter.length - 1; i++) {
              const groupAverage = { rho: 0, theta: 0 }
              let groupLength = 0

              while (i < linesToFilter.length - 1) {
                const rhoJump = linesToFilter[i + 1].rho - linesToFilter[i].rho

                if (rhoJump < 8) {
                  groupAverage.rho += linesToFilter[i].rho
                  groupAverage.theta += linesToFilter[i].theta
                  groupLength++
                  i++
                } else {
                  break
                }
              }

              if (groupLength !== 0) {
                groupAverage.rho /= groupLength
                groupAverage.theta /= groupLength
                averaged.push(groupAverage)
              } else {
                averaged.push(linesToFilter[i])
              }
            }

            if (averaged.length < 10) {
              return []
            }

            const centerIndex = Math.ceil(averaged.length / 2)
            const centerDiff = Math.abs(averaged[centerIndex + 1].rho) - Math.abs(averaged[centerIndex].rho)

            // append dummy line
            averaged.push({
              rho: averaged[averaged.length - 1].rho + centerDiff,
              theta: averaged[averaged.length - 1].theta,
            })

            const rhoDiffTolerance = centerDiff / 4
            let begin = 0
            let end = 0
            for (let i = 0; i < averaged.length - 1; i++) {
              const line = averaged[i]
              const nextLine = averaged[i + 1]
              const rhoDiff = Math.abs(nextLine.rho) - Math.abs(line.rho)
              const hasCorrectDiff = Math.abs(rhoDiff - centerDiff) < rhoDiffTolerance
              if (hasCorrectDiff) {
                end = i + 2
              } else {
                begin = i + 1
                end = begin + 1
              }

              const hasEnoughLines = end - begin >= 10
              if (hasEnoughLines) break
            }
            const notEnoughLines = end - begin < 10
            if (notEnoughLines) return []

            const filtered = averaged.slice(begin, end)
            return filtered
          }

          const filteredHorizontal = filterLines(horizontalLines, [255, 0, 0, 255])
          for (const { rho, theta } of filteredHorizontal) {
            let a = Math.cos(theta)
            let b = Math.sin(theta)
            let x0 = a * rho
            let y0 = b * rho
            let startPoint = { x: x0 - lineSize * b, y: y0 + lineSize * a }
            let endPoint = { x: x0 + lineSize * b, y: y0 - lineSize * a }
            cv.line(src, startPoint, endPoint, [0, 0, 255, 255], 2)
          }

          const filteredVertical = filterLines(verticalLines, [255, 255, 0, 255])
          for (const { rho, theta } of filteredVertical) {
            let a = Math.cos(theta)
            let b = Math.sin(theta)
            let x0 = a * rho
            let y0 = b * rho
            let startPoint = { x: x0 - lineSize * b, y: y0 + lineSize * a }
            let endPoint = { x: x0 + lineSize * b, y: y0 - lineSize * a }
            cv.line(src, startPoint, endPoint, [0, 255, 0, 255], 2)
          }

          const toCartesian = ({ rho, theta }) => ({
            x: Math.cos(theta) * rho,
            y: Math.sin(theta) * rho,
          })
          const intersection = (line1, line2) => {
            const cart1 = toCartesian(line1)
            const cart2 = toCartesian(line2)

            return { x: cart1.x + cart2.x, y: cart1.y + cart2.y }
          }

          if (filteredHorizontal.length === 10 && filteredVertical.length === 10) {
            console.log({ filteredHorizontal, filteredVertical })
            const roiPoints = [
              intersection(filteredHorizontal[0], filteredVertical[0]),
              intersection(filteredHorizontal[0], filteredVertical[filteredVertical.length - 1]),
              intersection(
                filteredHorizontal[filteredHorizontal.length - 1],
                filteredVertical[filteredVertical.length - 1]
              ),
              intersection(filteredHorizontal[filteredHorizontal.length - 1], filteredVertical[0]),
            ]
            roiPoints.push(roiPoints[0])

            /*
            for (let i = 0; i < roiPoints.length - 1; i++) {
              const start = roiPoints[i]
              const end = roiPoints[i + 1]
              cv.line(src, start, end, [0, 255, 255, 255], 2)
            }
            */

            for (let i = 0; i < roiPoints.length; i++) {
              const end = roiPoints[i]
              cv.line(src, { x: 0, y: 0 }, end, [255, 0, 255, 255], 1)
            }

            cv.circle(src, { x: 10, y: 10 }, 10, [255, 0, 0, 255], cv.FILLED)
          }
        }

        const runProcessing = () => {
          vc.read(src)
          processImage()
          cv.imshow(canvas, src)
          requestAnimationFrame(runProcessing)
        }

        requestAnimationFrame(runProcessing)

        // const mediaStreamTrack = mediaStream.getVideoTracks()[0]
        // const imageCapture = new ImageCapture(mediaStreamTrack)
        // console.log(imageCapture)

        // const imageBitmap = await imageCapture.grabFrame()

        // canvas.640 = imageBitmap.640
        // canvas.480 = imageBitmap.480
        // canvas.getContext("2d").drawImage(imageBitmap, 0, 0)
      } catch (e) {
        console.error("error:", e)
      }
    },
  },
  mounted() {},
}
</script>

<style lang="scss" scoped>
.webcam-wrapper {
  canvas {
  }
}
</style>
