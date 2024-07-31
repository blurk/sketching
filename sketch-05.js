const canvasSketch = require("canvas-sketch");
const { random } = require("canvas-sketch-util");
const math = require("canvas-sketch-util/math");

const settings = {
  dimensions: [1080, 1080],
  animate: true,
  fps: 2,
};

let manager;

let fontFamily = "monospace";

const typeCanvas = document.createElement("canvas");
const typeContext = typeCanvas.getContext("2d");

const sketch = ({ context, width, height }) => {
  const cell = 1;

  const cols = Math.floor(image.width / cell);
  const rows = Math.floor(image.height / cell);
  const numCells = cols * rows;

  typeCanvas.width = cols;
  typeCanvas.height = rows;

  typeContext.drawImage(image, 0, 0);

  return ({ context, width, height, frame }) => {
    const typeData = typeContext.getImageData(0, 0, cols, rows).data;

    context.fillStyle = "black";
    context.fillRect(0, 0, width, height);

    context.textBaseline = "middle";
    context.textAlign = "center";

    for (let i = 0; i < numCells; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const x = col * cell;
      const y = row * cell;

      const r = typeData[i * 4];
      const g = typeData[i * 4 + 1];
      const b = typeData[i * 4 + 2];
      const a = typeData[i * 4 + 3];

      const scaleX = width / image.width;
      const scaleY = height / image.height;

      const n = random.noise2D(x + frame * 10, y);

      const glyph = getGlyph(r);
      context.font = `${cell * (scaleX + scaleY + n)}px ${fontFamily}`;

      context.fillStyle = "white";

      context.save();
      context.translate(x * scaleX, y * scaleY);
      context.translate(cell * 0.5, cell * 0.5);
      context.rotate(n * Math.PI * 2);
      context.fillText(glyph, 0, 0);
      context.restore();
    }
  };
};

const getGlyph = (v) => {
  if (v < 50) return " ";
  if (v < 100) return "o";
  if (v < 150) return ".";
  if (v < 200) return "&";
  return "!";
};

const start = async () => {
  manager = await canvasSketch(sketch, settings);
};

const image = new Image();
image.src = "photo.png";

image.addEventListener("load", () => {
  start();
});
