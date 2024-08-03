const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const math = require("canvas-sketch-util/math");
const u_color = require("canvas-sketch-util/color");
const colormap = require("colormap");

const { colormapName } = require("./colormapName.js");

const TWEAK = {
  colorMap: colormapName.rainbow,
  rows: 7,
  cols: 171,
  midXMul: 1 / 3,
  midYMul: 3,
  lastXOffset: 177,
  lastYOffset: 283,
  lineWidthMin: 0,
  lineWidthMax: Math.PI * Math.E,
  frequency: 0.002,
  amplitude: 91,
};

const settings = {
  dimensions: [1080, 1080],
  animate: true,
  fps: 60,
};

const sketch = ({ width, height }) => {
  const cols = TWEAK.cols;
  const rows = TWEAK.rows;

  const numCells = cols * rows;

  const gridWidth = width * 0.8;
  const gridHeight = height * 0.8;

  const cellWidth = gridWidth / cols;
  const cellHeight = gridHeight / rows;

  const marginX = (width - gridWidth) / 2;
  const marginY = (height - gridHeight) / 2;

  const points = [];
  let x, y, n, lineWidth, color;
  let frequency = TWEAK.frequency;
  let amplitude = TWEAK.amplitude;

  let colors = colormap({
    colormap: TWEAK.colorMap,
    nshades: amplitude,
  });

  for (let i = 0; i < numCells; i++) {
    x = (i % cols) * cellWidth;
    y = Math.floor(i / cols) * cellHeight;

    n = random.noise2D(x, y, frequency, amplitude);
    // x += n;
    // y += n;

    lineWidth = math.mapRange(
      n,
      -amplitude,
      amplitude,
      TWEAK.lineWidthMin,
      TWEAK.lineWidthMax
    );
    color =
      colors[Math.floor(math.mapRange(n, -amplitude, amplitude, 0, amplitude))];

    points.push(new Point({ x, y, lineWidth, color }));
  }
  return ({ context, width, height, frame }) => {
    context.fillStyle = u_color.blend(color, "#111333").hex;
    context.fillRect(0, 0, width, height);

    context.save();
    context.translate(marginX, marginY);
    context.translate(cellWidth * 0.5, cellHeight * 0.5);
    context.strokeStyle = "gold";
    context.lineWidth = 4;

    // Update point position
    points.forEach((point) => {
      n = random.noise2D(
        point.initX + frame * (3 / 2),
        point.initY,
        frequency,
        amplitude
      );
      point.x = point.initX + n;
      point.y = point.initY + n;
    });

    let lastX, lastY;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols - 1; col++) {
        const current = points[row * cols + col];
        const next = points[row * cols + col + 1];

        const midX = current.x + (next.x - current.x) * TWEAK.midXMul;
        const midY = current.y + (next.y - current.y) * TWEAK.midYMul;

        if (col === 0) {
          lastX = current.x;
          lastY = current.y;
        }

        context.beginPath();

        context.lineWidth = current.lineWidth;
        context.strokeStyle = current.color;

        context.moveTo(lastX, lastY);
        context.quadraticCurveTo(current.x, current.y, midX, midY);

        context.stroke();

        lastX = midX - (col / cols) * TWEAK.lastXOffset;
        lastY = midY - (row / rows) * TWEAK.lastYOffset;
      }
    }

    context.restore();
  };
};

canvasSketch(sketch, settings);

class Point {
  #radius = 10;

  constructor({ x, y, lineWidth, color }) {
    this.x = x;
    this.y = y;
    this.lineWidth = lineWidth;
    this.color = color;

    this.initX = x;
    this.initY = y;
  }

  draw(context) {
    context.save();

    context.translate(this.x, this.y);
    context.beginPath();
    context.arc(0, 0, this.#radius, 0, Math.PI * 2);

    context.fillStyle = "gold";
    context.fill();

    context.restore();
  }
}
