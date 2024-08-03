const canvasSketch = require("canvas-sketch");
const csu_random = require("canvas-sketch-util/random");
const csu_color = require("canvas-sketch-util/color");
const csu_math = require("canvas-sketch-util/math");
const eases = require("eases");

const colormap = require("colormap");

const { colormapEva, colormapName } = require("./colormapName");

const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

let audio;

let /** @type {AnalyserNode} */ analyserNode,
  /** @type {AudioContext} */ audioContext,
  /** @type {Float32Array} */ audioData,
  /** @type {MediaElementAudioSourceNode} */ sourceNode;

let manager;

const sketch = () => {
  const numCircles = 13;
  const numSlices = 3;
  const slice = (Math.PI * 2) / numSlices;
  const radius = 31;

  const bins = [];
  const lineWidths = [];
  const rotationOffets = [];

  let lineWidth, bin, mapped, phi;

  for (let i = 0; i < numCircles * numSlices; i++) {
    bin = csu_random.rangeFloor(3, 31);

    bins.push(bin);
  }

  for (let i = 0; i < numCircles; i++) {
    const t = i / (numCircles - 1);
    lineWidth = eases.quadIn(t) * 200 + 20;
    lineWidths.push(lineWidth);
  }

  for (let i = 0; i < numCircles; i++) {
    rotationOffets.push(
      csu_random.range(Math.PI * -0.25, Math.PI * 0.25) - Math.PI * 0.5
    );
  }

  const colors = colormap({
    colormap: colormapName.summer,
    nshades: numCircles,
  });

  // const colors = colormapEva

  const bgColor = csu_random.pick(colors.slice(10));
  const fColor = csu_random.pick(colors.slice(-10));

  return ({ context, width, height }) => {
    context.fillStyle = context.fillStyle = csu_color.blend(
      bgColor,
      fColor
    ).hex;
    context.fillRect(0, 0, width, height);

    if (!audioContext) {
      return;
    }

    analyserNode.getFloatFrequencyData(audioData);

    context.save();
    context.translate(width * 0.5, height * 0.5);
    context.scale(1, -1);

    let cRadius = radius;

    for (let i = 0; i < numCircles; i++) {
      context.save();
      context.rotate(rotationOffets[i]);

      cRadius += lineWidths[i] * 0.5 + 2;

      context.strokeStyle = colors[i];

      for (let j = 0; j < numSlices; j++) {
        context.rotate(slice);
        context.lineWidth = lineWidths[i];

        bin = bins[i * numSlices + j];

        mapped = csu_math.mapRange(
          audioData[bin],
          analyserNode.minDecibels,
          analyserNode.maxDecibels,
          0,
          1,
          true
        );

        phi = slice * mapped;

        context.beginPath();
        context.arc(0, 0, cRadius, 0, phi);
        context.stroke();
      }

      cRadius += lineWidths[i] * 0.5;

      context.restore();
    }

    context.restore();
  };
};

const addListener = () => {
  window.addEventListener("mouseup", () => {
    if (!audioContext) {
      createAudio();
    }

    if (audio.paused) {
      audio.play();
      manager.play();
    } else {
      audio.pause();
      manager.pause();
    }
  });
};

const createAudio = () => {
  audio = document.createElement("audio");
  audio.src = "media/sound.mp3";

  audioContext = new AudioContext();

  sourceNode = audioContext.createMediaElementSource(audio);
  sourceNode.connect(audioContext.destination);

  analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = 512; // Always have to be power of 2
  analyserNode.smoothingTimeConstant = 0.9;
  sourceNode.connect(analyserNode);

  audioData = new Float32Array(analyserNode.frequencyBinCount);
};

const start = async () => {
  addListener();
  manager = await canvasSketch(sketch, settings);
  manager.pause();
};

start();
