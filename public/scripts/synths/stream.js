let numVoicesSlider;
let numVoicesNumber;
let panGainPosition;
let streamVoices = [];
let components = [];

import { scale } from "./utils.js";

export const createUi = () => {
  numVoicesSlider = Nexus.Add.Slider("#instrument", {
    size: [100, 20],
    min: 0,
    max: 16,
    step: 1,
  });
  numVoicesNumber = Nexus.Add.Number("#instrument");
  numVoicesNumber.link(numVoicesSlider);
  panGainPosition = Nexus.Add.Position("#instrument", {
    size: [400, 400],
    x: 0.5,
    y: 0,
  });
};

export const dispose = () => {
  numVoicesSlider.destroy();
  numVoicesNumber.destroy();
  painGainPosition.destroy();
  components.forEach((component) => component.dispose());
  streamVoices.forEach((voiceComponents) => {
    voiceComponents.forEach((component) => component.dispose());
  });
  streamVoices = [];
  components = [];
  document.getElementById("instrument").replaceChildren();
};

const createVoice = (lfoFrequency, baseFilterFrequency) => {
  const noise = new Tone.Noise("pink").start();
  const autoFilter = new Tone.AutoFilter({
    frequency: lfoFrequency,
    baseFrequency: baseFilterFrequency,
    octaves: 4,
  }).start();
  noise.connect(autoFilter);
  return [noise, autoFilter];
};

// todo: doesn't need to be async
export const play = async () => {
  // instantiate objects
  const reverb = new Tone.Reverb({
    decay: 0.7,
    preDelay: 0.03,
    wet: 0.4,
  });
  const gain = new Tone.Gain(0);
  const panner = new Tone.Panner(0);

  // connect objects
  reverb.connect(panner);
  panner.connect(gain);
  gain.toDestination();

  // transport
  Tone.Transport.bpm.value = 70;
  Tone.Transport.start();

  // ui
  const debouncedSliderHandler = _.debounce((v) => {
    const voiceCountDiff = v - streamVoices.length;
    if (voiceCountDiff === 0) return;
    if (voiceCountDiff > 0) {
      streamVoices = [
        ...streamVoices,
        ...Array(voiceCountDiff)
          .fill(1)
          .map((index) => {
            const voice = createVoice(10, 2000 * (index + 1));
            const [noise, autoFilter] = voice;
            autoFilter.connect(reverb);
            return voice;
          }),
      ];
    } else {
      const removed = streamVoices.splice(0, -voiceCountDiff);
      removed.forEach((voiceComponents) => {
        voiceComponents.forEach((component) => component.dispose());
      });
    }
  }, 100);

  components = [reverb, panner, gain];

  numVoicesSlider.on("change", debouncedSliderHandler);

  panGainPosition.on("change", ({ x, y }) => {
    panner.pan.value = scale(x, 0, 1, -1, 1);
    gain.gain.value = y;
  });
};
