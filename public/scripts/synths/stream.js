import { scale } from "./utils.js";

const createSynth = () => {
  let numVoicesSlider;
  let numVoicesNumber;
  let panGainPosition;
  let streamVoices = [];
  let components = [];

  const createUi = () => {
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

  const dispose = () => {
    // destroy UI
    numVoicesSlider.destroy();
    numVoicesNumber.destroy();
    panGainPosition.destroy();
    document.getElementById("instrument").replaceChildren();

    // fade gain to 0 over 5 seconds
    let gain = components[2]; // todo fancier
    gain.gain.rampTo(0, 5);

    // after 5 seconds (plus a little buffer), clean up all the sound pieces
    const fadeOut = setTimeout(() => {
      components.forEach((component) => component.dispose());
      streamVoices.forEach((voiceComponents) => {
        voiceComponents.forEach((component) => component.dispose());
      });
      streamVoices = [];
      components = [];
      clearTimeout(fadeOut);
    }, 5200);
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

  const play =  () => {
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

  return {
    createUi,
    dispose,
    play,
  };
};

export default createSynth;
