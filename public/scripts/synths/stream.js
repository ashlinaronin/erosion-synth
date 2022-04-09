let numVoicesSlider;
let numVoicesNumber;
let streamGainDial;
let streamVoices = [];
let components = [];

export const createUi = () => {
  numVoicesSlider = Nexus.Add.Slider("#instrument", {
    size: [100, 20],
    min: 0,
    max: 16,
    step: 1,
  });
  numVoicesNumber = Nexus.Add.Number("#instrument");
  numVoicesNumber.link(numVoicesSlider);
  streamGainDial = Nexus.Add.Dial("#instrument", {
    size: [100, 100],
  });
};

export const dispose = () => {
  numVoicesSlider.destroy();
  numVoicesNumber.destroy();
  streamGainDial.destroy();
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

  // connect objects
  reverb.connect(gain);
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

  components = [reverb, gain];

  numVoicesSlider.on("change", debouncedSliderHandler);

  streamGainDial.on("change", (v) => {
    gain.gain.value = v;
  });
};
