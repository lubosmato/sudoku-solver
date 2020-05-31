import cv from "opencv.js-webassembly"

/**
 * @typedef {Object} Point
 * @property {number} x x coord
 * @property {number} y y coord
 */

/**
 * @typedef {Object} Rect
 * @property {number} x x coord
 * @property {number} y y coord
 * @property {number} width width
 * @property {number} height height
 */

let isCvLoaded = false
const houghThresh = 130
const sortByRho = (a, b) => (a.rho - b.rho > 0 ? 1 : -1)

cv.onRuntimeInitialized = () => {
  isCvLoaded = true
}

export async function isReady() {
  return isCvLoaded
}

/**
 * Finds sudoku in given image
 * @param {Number} width image width
 * @param {Number} height image height
 * @param {Uint8Array} matArray source image
 * @returns {Rect[][]} cells
 */
export async function findSudoku(width, height, matArray, isFullAnalysis) {
  if (!isCvLoaded) return { corners: [], cells: [], image: null }

  const src = cv.matFromArray(height, width, cv.CV_8UC4, matArray)
  const img = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC1)
  cv.cvtColor(src, img, cv.COLOR_RGBA2GRAY, 0)
  cv.adaptiveThreshold(img, img, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 5)
  cv.bitwise_not(img, img)

  const houghLines = new cv.Mat()
  cv.HoughLines(img, houghLines, 1, Math.PI / 180 / 2, houghThresh, 0, 0, 0, Math.PI)
  img.delete()

  const lines = Array.from({ length: Math.ceil(houghLines.rows / 2) }, (v, i) =>
    houghLines.data32F.slice(i * 2, i * 2 + 2)
  ).map(line => {
    return { rho: line[0], theta: line[1] }
  })
  houghLines.delete()

  const angleTolerance = 0.3
  const horizontalLines = lines.filter(line => Math.abs(line.theta - Math.PI / 2) < angleTolerance).sort(sortByRho)

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

  const filteredHorizontal = filterLines(horizontalLines)
  const filteredVertical = filterLines(verticalLines)

  if (filteredHorizontal.length !== 10 || filteredVertical.length !== 10) {
    return { corners: [], cells: [], image: null }
  }

  const cells = []
  for (const [row, horizontal] of filteredHorizontal.slice(0, -1).entries()) {
    const cellRow = []
    for (const [col, vertical] of filteredVertical.slice(0, -1).entries()) {
      const { x, y } = intersection(horizontal, vertical)
      const cellEnd = intersection(filteredHorizontal[row + 1], filteredVertical[col + 1])
      cellRow.push({
        left: x,
        top: y,
        right: cellEnd.x,
        bottom: cellEnd.y,
      })
    }
    cells.push(cellRow)
  }

  let corners = [
    { x: cells[0][0].left, y: cells[0][0].top },
    { x: cells[0][8].right, y: cells[0][8].top },
    { x: cells[8][8].right, y: cells[8][8].bottom },
    { x: cells[8][0].left, y: cells[8][0].bottom },
  ]

  if (!isFullAnalysis) {
    return { corners, cells: [], image: null }
  }

  const fromPoints = cv.matFromArray(4, 1, cv.CV_32FC2, corners.map(({ x, y }) => [x, y]).flat())
  const toPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, width, 0, width, height, 0, height])

  const M = cv.getPerspectiveTransform(fromPoints, toPoints)
  fromPoints.delete()
  toPoints.delete()

  cv.warpPerspective(src, src, M, new cv.Size(width, height), cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar())

  const rawCells = cv.matFromArray(
    9 * 9 * 2,
    1,
    cv.CV_32FC2,
    cells
      .flat()
      .map(({ left, top, right, bottom }) => [left, top, right, bottom])
      .flat()
  )

  const transformedRawCells = cv.Mat.zeros(rawCells.rows, rawCells.cols, cv.CV_32FC2)
  cv.perspectiveTransform(rawCells, transformedRawCells, M)
  rawCells.delete()
  M.delete()

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const begin = row * 9 * 4 + col * 4

      cells[row][col].left = transformedRawCells.data32F[begin]
      cells[row][col].top = transformedRawCells.data32F[begin + 1]
      cells[row][col].right = transformedRawCells.data32F[begin + 2]
      cells[row][col].bottom = transformedRawCells.data32F[begin + 3]
    }
  }
  transformedRawCells.delete()

  corners = [
    { x: cells[0][0].left, y: cells[0][0].top },
    { x: cells[0][8].right, y: cells[0][8].top },
    { x: cells[8][8].right, y: cells[8][8].bottom },
    { x: cells[8][0].left, y: cells[8][0].bottom },
  ]

  cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0)
  cv.adaptiveThreshold(src, src, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 5)
  cv.cvtColor(src, src, cv.COLOR_GRAY2RGBA, 0)

  const image = new Uint8ClampedArray(src.data)

  return { corners, cells, image }
}

function filterLines(linesToFilter) {
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

function intersection(line1, line2) {
  // TODO do something with theta === 0?
  line1.theta += 0.0001
  line2.theta += 0.0001

  const s1 = Math.sin(line1.theta)
  const s2 = Math.sin(line2.theta)
  const c1 = Math.cos(line1.theta)
  const c2 = Math.cos(line2.theta)

  const x = (line2.rho / s2 - line1.rho / s1) / (c2 / s2 - c1 / s1)
  const y = (line1.rho - x * c1) / s1

  return { x, y }
}
