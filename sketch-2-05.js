const canvasSketch = require("canvas-sketch");
const canvasSketchUtils = require("canvas-sketch-util");
const eases = require("eases");
const colormap = require("colormap");
const colorInterpolate = require("color-interpolate");

const { colormapName } = require("./colormapName");

const settings = {
  dimensions: [1080, 1080],
  animate: true,
  fps: 60,
};

const particles = [];
const cursor = { x: Number.MAX_SAFE_INTEGER, y: Number.MAX_SAFE_INTEGER };

let /** @type {HTMLImageElement} */ image01,
  /** @type {HTMLImageElement} */ image02;

/**
 * @type {HTMLCanvasElement}
 */
let $canvas;
const colors = colormap({
  colormap: colormapName.spring,
  nshades: 20,
});

const sketch = ({ width, height, canvas }) => {
  $canvas = canvas;
  canvas.addEventListener("mousedown", onMouseDown);

  let x, y, particle, radius;

  const $canvasImage01 = document.createElement("canvas");
  $canvasImage01.width = image01.width;
  $canvasImage01.height = image01.height;
  const image01Context = $canvasImage01.getContext("2d");
  image01Context.drawImage(image01, 0, 0);

  const image01Data = image01Context.getImageData(
    0,
    0,
    image01.width,
    image01.height
  ).data;

  const $canvasImage02 = document.createElement("canvas");
  const image02Context = $canvasImage02.getContext("2d");
  $canvasImage02.width = image01.width;
  $canvasImage02.height = image01.height;
  image02Context.drawImage(image02, 0, 0);

  const image02Data = image02Context.getImageData(
    0,
    0,
    image02.width,
    image02.height
  ).data;

  const numberOfCircles = 18;
  const gapCircle = 2;
  const gapDot = 4;
  let dotRadius = 12;
  let circleRadius = 0;
  const fitRadius = dotRadius;

  for (let i = 0; i < numberOfCircles; i++) {
    const circumference = Math.PI * 2 * circleRadius;
    const numFit = i ? Math.floor(circumference / (fitRadius * 2 + gapDot)) : 1;
    const fitSlice = (Math.PI * 2) / numFit;

    for (let j = 0; j < numFit; j++) {
      const theta = fitSlice * j;

      x = Math.cos(theta) * circleRadius;
      y = Math.sin(theta) * circleRadius;

      x += width * 0.5;
      y += height * 0.5;

      const imageX = Math.floor((x / width) * image01.width);
      const imageY = Math.floor((y / height) * image01.height);

      const imageIndex = (imageY * image01.width + imageX) * 4;

      const r = image01Data[imageIndex + 0];
      const g = image01Data[imageIndex + 1];
      const b = image01Data[imageIndex + 2];

      const image01Color = `rgb(${r}, ${g}, ${b})`;

      const r2 = image02Data[imageIndex + 0];
      const g2 = image02Data[imageIndex + 1];
      const b2 = image02Data[imageIndex + 2];

      const image02Color = `rgb(${r2}, ${g2}, ${b2})`;

      const colorMap = colorInterpolate([image01Color, image02Color]);

      radius = canvasSketchUtils.math.mapRange(r, 0, 255, 1, 13);

      particle = new Particle({ x, y, radius, colorMap });
      particles.push(particle);
    }

    circleRadius += fitRadius * 2 + gapCircle;
    dotRadius = (1 - eases.quadIn(i / numberOfCircles)) * fitRadius;
  }

  /**
   * @param {object} o
   * @param {CanvasRenderingContext2D} o.context
   */
  return ({ context, width, height }) => {
    context.fillStyle = "black";
    context.fillRect(0, 0, width, height);

    // context.drawImage($canvasImage01, 0, 0);

    particles.sort((a, b) => a.scale - b.scale);

    particles.forEach((particle) => {
      particle.update();
      particle.draw(context);
    });
  };
};

class Particle {
  constructor({ x, y, radius = 10, colorMap }) {
    // position
    this.x = x;
    this.y = y;

    // acceleration
    this.aX = 0;
    this.aY = 0;

    // velocity
    this.vX = 0;
    this.vY = 0;

    // init pos
    this.iX = x;
    this.iY = y;

    this.radius = radius;
    this.scale = 1;

    this.colorMap = colorMap;
    this.color = colorMap(0);

    this.minDist = canvasSketchUtils.random.range(100, 200);
    this.pushFactor = canvasSketchUtils.random.range(0.01, 0.02);
    this.pullFactor = canvasSketchUtils.random.range(0.002, 0.006);
    this.dampFactor = canvasSketchUtils.random.range(0.9, 0.95);
  }

  update() {
    let dx, dy, dd, distDelta;
    let indexColor;

    //pull
    dx = this.iX - this.x;
    dy = this.iY - this.y;
    dd = Math.sqrt(dx * dx + dy * dy);

    this.scale = canvasSketchUtils.math.mapRange(dd, 0, 200, 1, 5);

    // indexColor = Math.floor(
    //   canvasSketchUtils.math.mapRange(dd, 0, 200, 0, colors.length - 1, true)
    // );

    indexColor = canvasSketchUtils.math.mapRange(dd, 0, 200, 0, 1, true);

    this.color = this.colorMap(indexColor);

    // this.color = colors[indexColor];

    this.aX = dx * this.pullFactor;
    this.aY = dy * this.pullFactor;

    // push
    dx = this.x - cursor.x;
    dy = this.y - cursor.y;
    dd = Math.sqrt(dx * dx + dy * dy);

    distDelta = this.minDist - dd;

    if (dd < this.minDist) {
      // the smaller dd is, the stronger the force
      this.aX += (dx / dd) * distDelta * this.pushFactor;
      this.aY += (dy / dd) * distDelta * this.pushFactor;
    }

    this.vX += this.aX;
    this.vY += this.aY;

    this.vX *= this.dampFactor;
    this.vY *= this.dampFactor;

    this.x += this.vX;
    this.y += this.vY;
  }

  /**
   *
   * @param {CanvasRenderingContext2D} context
   */
  draw(context) {
    context.save();
    context.translate(this.x, this.y);

    context.fillStyle = this.color;

    context.beginPath();
    context.arc(0, 0, this.radius * this.scale, 0, Math.PI * 2);

    context.fill();
    context.restore();
  }
}

const onMouseDown = (e) => {
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);

  onMouseMove(e);
};

const onMouseMove = (e) => {
  const x = (e.offsetX / $canvas.offsetWidth) * $canvas.width;
  const y = (e.offsetY / $canvas.offsetHeight) * $canvas.height;

  cursor.x = x;
  cursor.y = y;
};

const onMouseUp = () => {
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseup", onMouseUp);

  cursor.x = Number.MAX_SAFE_INTEGER;
  cursor.y = Number.MAX_SAFE_INTEGER;
};

const loadImage = async (url) => {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => rej();

    img.src = url;
  });
};

const start = async () => {
  image01 = await loadImage("./media/image-01.jpg");
  image02 = await loadImage("./media/image-03.jpg");

  canvasSketch(sketch, settings);
};

start();
