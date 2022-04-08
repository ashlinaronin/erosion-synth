let numVoicesSlider;
let gainDial;
let streamVoices = [];
let components = [];

export const createUi = () => {
  numVoicesSlider = Nexus.Add.Slider("#instrument", {
    size: [100, 20],
    min: 0,
    max: 8,
    step: 1,
  });
  gainDial = Nexus.Add.Dial("#instrument", {
    size: [100, 100],
  });
};

export const dispose = () => {
  numVoicesSlider.destroy();
  gainDial.destroy();
  components.forEach((component) => component.dispose());
  streamVoices.forEach((voiceComponents) => {
    voiceComponents.forEach((component) => component.dispose());
  });
  streamVoices = [];
  components = [];
};

const createVoice = (lfoFrequency, baseFilterFrequency) => {
  const noise = new Tone.Noise("pink").start();
  const autoFilter = new Tone.AutoFilter({
    frequency: lfoFrequency,
    baseFrequency: baseFilterFrequency,
    octaves: 8,
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
          .map(() => {
            const voice = createVoice(10, 10000);
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

  gainDial.on("change", (v) => {
    gain.gain.value = v;
  });
};
