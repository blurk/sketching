// SKEW
const canvasSketch = require("canvas-sketch");
const math = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const color = require("canvas-sketch-util/color");
const risoColors = require("riso-colors");

const seed = random.getRandomSeed();

const settings = {
  dimensions: [1080, 1080],
  animate: true,
  fps: 60,
  name: seed,
};

const sketch = ({ context, width, height }) => {
  random.setSeed(seed);

  let x, y, w, h, fill, stroke, blend;

  const num = 29;
  const degrees = -30;

  const rects = [];

  const colors = [random.pick(risoColors), random.pick(risoColors)];

  for (let i = 0; i < num; i++) {
    x = random.range(0, width);
    y = random.range(0, height);
    w = random.range(200, width);
    h = random.range(40, 200);

    fill = random.pick(colors).hex;
    stroke = random.pick(colors).hex;

    blend = random.value() > 0.5 ? "overlay" : "source-over";

    rects.push({ x, y, w, h, fill, stroke, blend });
  }

  const bgColor = random.pick(risoColors).hex;

  const mask = {
    radius: width * 0.4,
    sides: 3,
    x: width * 0.5,
    y: height * 0.58,
  };

  return ({ context, width, height, frame }) => {
    context.fillStyle = bgColor;
    context.fillRect(0, 0, width, height);

    context.save();
    context.translate(mask.x, mask.y);
    drawPolygon({ context, radius: mask.radius, sides: mask.sides });
    context.restore();
    context.clip();

    rects.forEach(({ x, y, w, h, fill, stroke }) => {
      const v = frame * 0.166667;

      context.save();
      context.translate(x - v, y + v);
      context.strokeStyle = stroke;
      context.fillStyle = fill;

      const shadowColor = color.offsetHSL(fill, 0, 0, -20);
      shadowColor.rgba[3] = 0.5;

      context.globalCompositeOperation = blend;

      drawSkewRect({ context, w, h, degrees });
      context.lineWidth = 13;
      context.shadowColor = color.style(shadowColor.rgba);
      // context.shadowColor = `rgba(0,0,0,0.5)`;
      context.shadowOffsetX = -10;
      context.shadowOffsety = 20;

      context.fill();
      context.shadowColor = null;
      context.stroke();

      context.globalCompositeOperation = "source-over";

      context.lineWidth = 2;
      context.strokeStyle = "black";
      context.stroke();

      context.restore();
    });

    context.save();
    context.translate(mask.x, mask.y);

    context.lineWidth = 23;
    drawPolygon({
      context,
      radius: mask.radius - context.lineWidth,
      sides: mask.sides,
    });

    context.globalCompositeOperation = "color-burn";
    context.strokeStyle = colors[0].hex;
    context.stroke();

    context.restore();
  };
};

const drawSkewRect = ({ context, w = 600, h = 600, degrees = -45 }) => {
  const angle = math.degToRad(degrees);
  const rx = Math.cos(angle) * w;
  const ry = Math.sin(angle) * w;

  context.save();
  context.translate(rx * -0.5, (ry + h) * -0.5);

  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(rx, ry);
  context.lineTo(rx, ry + h);
  context.lineTo(0, h);
  context.closePath();
  context.fill();
  context.stroke();
  context.restore();
};

const drawPolygon = ({ context, radius = 100, sides = 3 }) => {
  const slice = (Math.PI * 2) / sides;

  context.beginPath();
  context.moveTo(0, -radius);

  for (let i = 1; i < sides; i++) {
    const thelta = i * slice - Math.PI * 0.5;
    context.lineTo(Math.cos(thelta) * radius, Math.sin(thelta) * radius);
  }

  context.closePath();
};

canvasSketch(sketch, settings);
