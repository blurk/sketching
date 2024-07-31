const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const math = require("canvas-sketch-util/math");

const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

const sketch = ({ context, width, height }) => {
  const agents = [];

  Array(40)
    .fill()
    .forEach(() => {
      const x = random.range(0, width);
      const y = random.range(0, height);
      agents.push(new Agent(x, y));
    });

  return ({ context, width, height }) => {
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];

      for (let j = i + 1; j < agents.length; j++) {
        const other = agents[j];

        const dist = agent.pos.getDistance(other.pos);

        if (dist > 200) {
          continue;
        }

        context.lineWidth = math.mapRange(dist, 0, 200, 12, 1);

        context.beginPath();
        context.moveTo(agent.pos.x, agent.pos.y);
        context.lineTo(other.pos.x, other.pos.y);
        context.stroke();
      }
    }

    agents.forEach((agent, i) => {
      agent.update();
      agent.draw(context);

      i % 2 === 0 ? agent.bounce(width, height) : agent.warp(width, height);
    });
  };
};

canvasSketch(sketch, settings);

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  getDistance(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;

    return Math.sqrt(dx ** 2 + dy ** 2);
  }
}

class Agent {
  constructor(x = 0, y = 0) {
    this.pos = new Vector(x, y);
    this.vel = new Vector(random.range(-1, 1), random.range(-1, 1));
    this.r = random.range(4, 12);
  }

  draw(context) {
    context.save();
    context.beginPath();
    context.lineWidth = 4;
    context.translate(this.pos.x, this.pos.y);
    context.arc(0, 0, this.r, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.restore();
  }

  update() {
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
  }

  bounce(width, height) {
    if (this.pos.x <= 0 || this.pos.x >= width) {
      this.vel.x = -this.vel.x;
    }

    if (this.pos.y <= 0 || this.pos.y >= height) {
      this.vel.y = -this.vel.y;
    }
  }

  warp(width, height) {
    if (this.pos.x >= width) {
      this.pos.x = 0;
    }

    if (this.pos.x <= 0) {
      this.pos.x = width;
    }

    if (this.pos.y >= height) {
      this.pos.y = 0;
    }

    if (this.pos.y <= 0) {
      this.pos.y = height;
    }
  }
}
