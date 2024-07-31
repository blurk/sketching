const canvasSketch = require("canvas-sketch");

const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

let $canvas, points;

const sketch = ({ canvas }) => {
  canvas.addEventListener("mousedown", onMouseDown);
  $canvas = canvas;

  points = [
    new Point({ x: 200, y: 540 }),
    new Point({ x: 400, y: 700 }),
    new Point({ x: 800, y: 540 }),
    new Point({ x: 600, y: 700 }),
    new Point({ x: 640, y: 900 }),
  ];

  return ({ context, width, height }) => {
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);

    context.strokeStyle = "#999";
    for (let i = 1; i < points.length; i++) {
      context.lineTo(points[i].x, points[i].y);
    }

    context.stroke();

    // context.beginPath();
    // context.moveTo(points[0].x, points[0].y);

    // for (let i = 1; i < points.length; i += 2) {
    //   context.quadraticCurveTo(
    //     points[i].x,
    //     points[i].y,
    //     points[i + 1].x,
    //     points[i + 1].y
    //   );
    // }

    // context.stroke();

    context.beginPath();
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const midX = current.x + (next.x - current.x) * 0.5;
      const midY = current.y + (next.y - current.y) * 0.5;

      // context.beginPath();
      // context.arc(midX, midY, 5, 0, Math.PI * 2);
      // context.fill();

      if (i === 0) {
        context.moveTo(midX, midY);
      } else {
        context.quadraticCurveTo(current.x, current.y, midX, midY);
      }
    }

    context.fillStyle = "blue";
    context.lineWidth = 4;
    context.stroke();

    points.forEach((point) => {
      point.draw(context);
    });
  };
};

const onMouseDown = (e) => {
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);

  const x = (e.offsetX / $canvas.offsetWidth) * $canvas.width;
  const y = (e.offsetY / $canvas.offsetHeight) * $canvas.height;

  let hit = false;
  points.forEach((point) => {
    point.isHit = point.hitTest(x, y);

    if (!hit && point.isHit) {
      hit = true;
    }
  });

  if (!hit) {
    points.push(new Point({ x, y }));
  }
};

const onMouseMove = (e) => {
  const x = (e.offsetX / $canvas.offsetWidth) * $canvas.width;
  const y = (e.offsetY / $canvas.offsetHeight) * $canvas.height;

  points.forEach((point) => {
    if (point.isHit) {
      point.x = x;
      point.y = y;
    }
  });
};

const onMouseUp = () => {
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseup", onMouseUp);
};

canvasSketch(sketch, settings);

class Point {
  #radius = 10;
  constructor({ x, y, control = false }) {
    this.x = x;
    this.y = y;
    this.control = control;
  }

  draw(context) {
    context.save();

    context.translate(this.x, this.y);
    context.beginPath();
    context.arc(0, 0, this.#radius, 0, Math.PI * 2);

    context.fillStyle = this.control ? "red" : "black";
    context.fill();

    context.restore();
  }

  hitTest(x, y) {
    const dx = this.x - x;
    const dy = this.y - y;
    const dd = Math.sqrt(dx * dx + dy * dy);

    return dd < this.#radius * 2;
  }
}
