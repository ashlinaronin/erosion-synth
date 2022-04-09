let xyPad;
let components = [];

import { scale } from "./utils.js";

export const createUi = () => {
  xyPad = Nexus.Add.Position("#instrument", {
    size: [400, 400],
  });
};

export const dispose = () => {
  xyPad.destroy();
  components.forEach((component) => component.dispose());
  components = [];
  document.getElementById("instrument").replaceChildren();
};

export const play = async () => {
  // instantiate objects

  //   const lfo = new Tone.LFO({
  //     frequency: 60,
  //     type: "triangle",
  //     min: 200,
  //     max: 400,
  //   }).start();
  const oscillator1 = new Tone.FMOscillator({
    frequency: 100,
    detune: -3,
    type: "square",
    modulationType: "square",
    harmonicity: 0.6,
    modulationIndex: 13,
    volume: -12,
  }).start();
  const oscillator2 = new Tone.FMOscillator({
    frequency: 100,
    detune: 3,
    type: "triangle",
    modulationType: "sine",
    harmonicity: 6,
    modulationIndex: 8,
    volume: -12,
  }).start();
  const ampEnv = new Tone.AmplitudeEnvelope({
    attack: 0.01,
    decay: 0.5,
    sustain: 0.7,
    release: 0.5,
  });
  const freqEnv = new Tone.FrequencyEnvelope({
    attack: 0.01,
    baseFrequency: "C3",
    octaves: 2,
    exponent: 3.5,
  });
    const filter = new Tone.Filter(3000, "lowpass");
  // const filter = new Tone.FeedbackCombFilter(0.0183, 0.2);

  const reverb = new Tone.Reverb({
    decay: 0.7,
    preDelay: 0.03,
    wet: 0.4,
  });

  const distortion = new Tone.Distortion(0.25);

  // connect objects
  oscillator1.connect(ampEnv);
  oscillator2.connect(ampEnv);
  //   oscillator2.connect(oscillator1.frequency);
  //   lfo.connect(oscillator1.frequency);
  // ampEnv.connect(filter);
  ampEnv.connect(distortion);
  distortion.connect(filter);
  filter.connect(reverb);
  reverb.toDestination();

  // transport
  Tone.Transport.bpm.value = 70;
  Tone.Transport.start();

  const pattern = new Tone.Pattern(
    function (time, note) {
      oscillator1.frequency.value = note;
      freqEnv.baseFrequency = note;
      ampEnv.triggerAttackRelease("16n", time);
      freqEnv.triggerAttack();
    },
    ["C2", "D2", "E2", "A2"],
    "upDown"
  );

  // pattern.start();

  components = [oscillator1, oscillator2, ampEnv, freqEnv, filter, reverb];

  // ui
  const debouncedXyHandler = _.debounce(({ x, y }) => {
    console.log(x, y);
    const freq = scale(x, 0, 1, 40, 100);
    const dist = scale(y, 0, 1, 0.3, 1);
    const decay = scale(y, 0, 1, 0, 2);
    const release = scale(y, 0, 1, 0, 5);
    oscillator1.frequency.value = freq;
    oscillator2.frequency.value = freq;
    ampEnv.decay = decay;
    ampEnv.release = release;
    freqEnv.baseFrequency = freq;
    distortion.distortion = dist;
    ampEnv.triggerAttackRelease("16n");
    freqEnv.triggerAttack();
  }, 10);

  xyPad.on("change", debouncedXyHandler);
};
