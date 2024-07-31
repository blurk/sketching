const canvasSketch = require("canvas-sketch");
const math = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");

const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

const sketch = () => {
  const numOfCircle = 14;

  return ({ context: c, width, height }) => {
    c.fillStyle = "white";
    c.fillRect(0, 0, width, height);

    for (let i = 0; i < numOfCircle; i++) {
      const cx = width * 0.5;
      const cy = height * 0.5;

      const w = width * 0.01;
      const h = height * 0.1;

      let x, y;

      const num = 48;

      for (let i = 0; i < num; i++) {
        const radius = width * random.range(0.01, 0.3);
        const slice = math.degToRad(360 / num);
        const angle = slice * i;

        x = cx + radius * Math.sin(angle);
        y = cy + radius * Math.cos(angle);

        c.fillStyle = random.pick([
          "#0f5e9c",
          "#2389da",
          "#1ca3ec",
          "#5abcd8",
          "#74ccf4",
        ]);

        c.strokeStyle = random.pick([
          "#0f5e9c",
          "#2389da",
          "#1ca3ec",
          "#5abcd8",
          "#74ccf4",
        ]);

        c.save();
        c.translate(x, y);
        c.rotate(-angle);
        c.scale(random.range(0.2, 0.8), random.range(0.4, 0.8));
        c.beginPath();
        c.rect(-w * 0.5, random.range(0.5, -h * 0.5), w, h);
        c.fill();
        c.restore();

        c.save();
        c.translate(cx, cy);
        c.rotate(angle);
        c.lineWidth = random.range(5, 20);
        c.beginPath();
        c.arc(
          0,
          0,
          radius * random.range(0.6, 1.4),
          slice * random.range(-4, 0),
          slice * random.range(0, 4)
        );
        c.stroke();
        c.restore();
      }
    }
  };
};

canvasSketch(sketch, settings);
