const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const math = require("canvas-sketch-util/math");
const { Pane } = require("tweakpane");

const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

const params = {
  cols: 10,
  rows: 10,
  scaleMin: 1,
  scaleMax: 30,
  frequency: 0.001,
  amplitude: 1,
  animate: true,
  frame: 0,
  lineCap: "butt",
  percentH: 0.8,
  percentW: 0.8,
};

const sketch = () => {
  return ({ context, width, height, frame }) => {
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    const cols = params.cols;
    const rows = params.rows;
    const numCells = cols * rows;

    const gridW = width * params.percentW;
    const gridH = height * params.percentH;
    const cellW = gridW / cols;
    const cellH = gridH / rows;
    const marginX = (width - gridW) * 0.5;
    const marginY = (height - gridH) * 0.5;

    for (let i = 0; i < numCells; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const x = col * cellW;
      const y = row * cellH;

      const w = cellW * 0.8;

      const f = params.animate ? frame : params.frame;

      const n = random.noise3D(
        x,
        y,
        f * 10,
        params.frequency,
        params.amplitude
      );

      const angle = n * Math.PI * 0.2;
      const scale = math.mapRange(
        n,
        -1,
        1,
        params.scaleMin,
        params.scaleMax,
        30
      );

      context.save();
      context.translate(x, y);
      context.translate(marginX, marginY);
      context.translate(cellW * 0.5, cellH * 0.5);
      context.rotate(angle);

      context.lineWidth = scale;
      context.lineCap = params.lineCap;

      context.beginPath();
      context.moveTo(w * -0.5, 0);
      context.lineTo(w * 0.5, 0);
      context.stroke();
      context.restore();
    }
  };
};

const createPane = () => {
  const pane = new Pane();

  let folder = pane.addFolder({ title: "Grid" });
  folder.addBinding(params, "cols", { min: 2, max: 50, step: 1 });
  folder.addBinding(params, "rows", { min: 2, max: 50, step: 1 });
  folder.addBinding(params, "scaleMin", { min: 1, max: 100 });
  folder.addBinding(params, "scaleMax", { min: 1, max: 100 });
  folder.addBinding(params, "percentW", { min: 0.1, max: 1, step: 0.1 });
  folder.addBinding(params, "percentH", { min: 0.1, max: 1, step: 0.1 });
  folder.addBinding(params, "lineCap", {
    options: {
      butt: "butt",
      round: "round",
      square: "square",
    },
  });

  folder = pane.addFolder({ title: "Noise" });
  folder.addBinding(params, "frequency", { min: -0.01, max: 0.01 });
  folder.addBinding(params, "amplitude", { min: 0, max: 1 });
  folder.addBinding(params, "animate");
  folder.addBinding(params, "frame", { min: 0, max: 999 });
};

createPane();
canvasSketch(sketch, settings);
