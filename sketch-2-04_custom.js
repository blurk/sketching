const canvasSketch = require("canvas-sketch");
const { colormapEva } = require("./colormapName");
const utils = require("canvas-sketch-util");
const eases = require("eases");

const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

let audio,
  manager,
  bins = [];

let /** @type {AnalyserNode} */ analyserNode,
  /** @type {AudioContext} */ audioContext,
  /** @type {Float32Array} */ audioData,
  /** @type {MediaElementAudioSourceNode} */ sourceNode;

const sketch = ({ width, height }) => {
  const numLines = 13;

  for (let i = 0; i < numLines; i++) {
    const bin = utils.random.rangeFloor(3, 131);
    bins.push(bin);
  }

  /**
   * @param {object} obj
   * @param {CanvasRenderingContext2D} obj.context
   * @param {number} obj.width
   * @param {number} obj.height
   */
  return ({ context, width, height }) => {
    context.fillStyle = "#232311";
    context.fillRect(0, 0, width, height);
    context.moveTo(width * 0.2, height * 0.2);

    if (!audioContext) {
      return;
    }

    analyserNode.getFloatFrequencyData(audioData);

    for (let i = 0; i < numLines; i++) {
      const mapped = utils.math.mapRange(
        utils.random.pick(audioData),
        analyserNode.minDecibels,
        analyserNode.maxDecibels,
        width * -0.2,
        width * 0.4,
        true
      );

      const offsetX = mapped || 0;

      context.save();

      context.beginPath();
      context.moveTo(width * 0.5, width * 0.2);
      context.quadraticCurveTo(
        width * 0.5 + offsetX,
        height * 0.5,
        width * 0.5,
        height * 0.8
      );

      context.lineWidth = 4;
      context.strokeStyle = utils.random.pick(colormapEva);
      // context.strokeStyle = "#FFF";
      context.stroke();
      context.restore();
    }
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
  // audio.src = "media/one-last-kiss-instrumental.mp3";
  audio.src = "media/sound.mp3";

  audioContext = new AudioContext();

  sourceNode = audioContext.createMediaElementSource(audio);
  sourceNode.connect(audioContext.destination);

  analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = 512; // Always have to be power of 2
  analyserNode.smoothingTimeConstant = 0.9999;
  sourceNode.connect(analyserNode);

  audioData = new Float32Array(analyserNode.frequencyBinCount);
};

const start = async () => {
  addListener();
  manager = await canvasSketch(sketch, settings);
  manager.pause();
};

start();
