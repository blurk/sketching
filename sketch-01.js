const canvasSketch = require("canvas-sketch");

const settings = {
  dimensions: [1080, 1080],
};

const sketch = () => {
  return ({ context, width, height }) => {
    /** @type {CanvasRenderingContext2D} */
    const c = context;
    c.fillStyle = "black";
    c.fillRect(0, 0, width, height);
    c.lineWidth = width * 0.01;
    c.strokeStyle = "white";

    const w = width * 0.1;
    const h = height * 0.1;
    const gap = width * 0.03;
    const initX = width * 0.17;
    const initY = height * 0.17;
    let x, y;

    const off = width * 0.02;

    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        x = initX + (w + gap) * i;
        y = initY + (h + gap) * j;

        c.beginPath();
        c.rect(x, y, w, h);
        c.stroke();

        if (Math.random() > 0.5) {
          c.beginPath();
          c.rect(x + off / 2, y + off / 2, w - off, h - off);
          c.stroke();
        }
      }
    }
  };
};

canvasSketch(sketch, settings);
