const canvasSketch = require("canvas-sketch");
const utils = require("canvas-sketch-util");

const settings = {
  dimensions: [1080, 1080],
  animate: true,
  fps: 60,
};

const num = 17371;
let particles = [];

/**
 * @param {object} o
 * @param {number} o.width
 * @param {number} o.height
 * @param {number} o.frame
 */
const sketch = ({ width, height }) => {
  for (let i = 0; i < num; i++) {
    const x = utils.random.range(-width * 2, width);
    const y = utils.random.range(-height * 2, height);

    particles.push(new Particle(x, y));
  }
  /**
   * @param {object} o
   * @param {CanvasRenderingContext2D} o.context
   * @param {number} o.width
   * @param {number} o.height
   * @param {number} o.frame
   */
  return ({ context, width, height, frame }) => {
    context.fillStyle = "#101010";
    context.fillRect(0, 0, width, height);

    const centerCircleR = width * 0.13;

    const maxRotation = 100;
    let count = 0;

    for (let i = 0; i < particles.length; i++) {
      if (count > maxRotation) {
        particles[i].x -= 10;
        particles[i].y -= 10;
        count = 0;
      }

      particles[i].draw(context);

      const { x, y, initX, initY } = particles[i];

      const origin = { x: width * 0.5, y: height * 0.5 };

      const dx = x - origin.x;
      const dy = y - origin.y;
      const dd = dx * dx + dy * dy;
      const distanceToCenter = Math.sqrt(dd);

      const theta = utils.math.degToRad(
        (0.1 * distanceToCenter) / centerCircleR
      );

      const newX =
        (x - origin.x) * Math.cos(theta) -
        (y - origin.y) * Math.sin(theta) +
        origin.x;

      const newY =
        (x - origin.x) * Math.sin(theta) +
        (y - origin.y) * Math.cos(theta) +
        origin.y;

      particles[i].x = newX;
      particles[i].y = newY;

      count++;
    }

    context.save();
    context.beginPath();
    context.arc(width * 0.5, height * 0.5, centerCircleR, 0, Math.PI * 2);
    context.fillStyle = "#101010";
    context.fill();
    context.restore();
  };
};

canvasSketch(sketch, settings);

class Particle {
  /**
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    this.initX = x;
    this.initY = y;

    this.x = x;
    this.y = y;

    this.radius = utils.random.range(0.1, 1.7);
    // this.radius = 10;
  }

  /**
   * @param {CanvasRenderingContext2D} context
   */
  draw(context) {
    context.save();

    context.translate(this.x, this.y);

    context.beginPath();
    context.arc(0, 0, this.radius, 0, Math.PI * 2);
    context.fillStyle = "#FFF";
    context.fill();

    context.restore();
  }
}
