import { scale } from "./utils.js";

const createSynth = () => {
  let xyPad;
  let components = [];

  const createUi = () => {
    xyPad = Nexus.Add.Position("#instrument", {
      size: [400, 400],
    });
  };

  const dispose = () => {
    xyPad.destroy();
    components.forEach((component) => component.dispose());
    components = [];
    document.getElementById("instrument").replaceChildren();
  };

  const play = () => {
    // instantiate objects
    const oscillator1 = new Tone.FMOscillator({
      frequency: 100,
      detune: -5,
      type: "square",
      modulationType: "sine",
      harmonicity: 0.6,
      modulationIndex: 8,
      volume: -16,
    }).start();
    const oscillator2 = new Tone.FMOscillator({
      frequency: 100,
      detune: 5,
      type: "triangle",
      modulationType: "sine",
      harmonicity: 0.9,
      modulationIndex: 13,
      volume: -16,
    }).start();
    const ampEnv = new Tone.AmplitudeEnvelope({
      attack: 0.01,
      decay: 0.01,
      sustain: 0.1,
      release: 0.01,
    });
    const freqEnv = new Tone.FrequencyEnvelope({
      attack: 0.01,
      baseFrequency: "C3",
      octaves: 2,
      exponent: 3.5,
    });
    const filter = new Tone.Filter(1800, "lowpass");

    const reverb = new Tone.Reverb({
      decay: 0.7,
      preDelay: 0.03,
      wet: 0.4,
    });

    const distortion = new Tone.Distortion(0.15);

    // connect objects
    oscillator1.connect(ampEnv);
    oscillator2.connect(ampEnv);
    ampEnv.connect(distortion);
    distortion.connect(filter);
    filter.connect(reverb);
    reverb.toDestination();

    // transport
    Tone.Transport.bpm.value = 30;
    Tone.Transport.start();

    components = [oscillator1, oscillator2, ampEnv, freqEnv, filter, reverb];

    // ui
    const debouncedXyHandler = _.debounce(({ x, y }) => {
      console.log(x, y);
      const freq = scale(x, 0, 1, 40, 160);
      const dist = scale(y, 0, 1, 0.3, 1);
      const decay = scale(y, 0, 1, 0, 2);
      const release = scale(y, 0, 1, 0, 3);
      oscillator1.frequency.value = freq;
      oscillator2.frequency.value = freq;
      ampEnv.decay = decay;
      ampEnv.release = release;
      freqEnv.baseFrequency = freq;
      distortion.distortion = dist;
      ampEnv.triggerAttackRelease("32n");
      freqEnv.triggerAttack();
    }, 10);

    xyPad.on("change", debouncedXyHandler);
  };

  return {
    createUi,
    dispose,
    play,
  };
};

export default createSynth;
