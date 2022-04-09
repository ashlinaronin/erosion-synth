let wind1GainDial;
let wind2GainDial;
let wind1FreqDial;
let wind2FreqDial;
let components = [];

import { scale } from "./utils.js";

export const createUi = () => {
  wind1GainDial = Nexus.Add.Dial("#instrument", {
    size: [100, 100],
  });
  wind2GainDial = Nexus.Add.Dial("#instrument", {
    size: [100, 100],
  });
  wind1FreqDial = Nexus.Add.Dial("#instrument", {
    size: [100, 100],
  });
  wind2FreqDial = Nexus.Add.Dial("#instrument", {
    size: [100, 100],
  });
};

export const dispose = () => {
  wind1GainDial.destroy();
  wind2GainDial.destroy();
  wind1FreqDial.destroy();
  wind2FreqDial.destroy();
  components.forEach((component) => component.dispose());
  components = [];
  document.getElementById("instrument").replaceChildren();
};

export const play = async () => {
  // instantiate objects
  const noise = new Tone.Noise("pink").start();
  const gain1 = new Tone.Gain(0);
  const gain2 = new Tone.Gain(0);

  const autoFilter1 = new Tone.AutoFilter({
    frequency: 0.05,
    baseFrequency: 16000,
    octaves: 8,
  }).start();
  const autoFilter2 = new Tone.AutoFilter({
    frequency: 0.15,
    baseFrequency: 8000,
    octaves: 4,
  }).start();
  const reverb = new Tone.Reverb({
    decay: 0.7,
    preDelay: 0.03,
    wet: 0.4,
  });

  // connect objects
  noise.connect(autoFilter1);
  noise.connect(autoFilter2);
  autoFilter1.connect(gain1);
  autoFilter2.connect(gain2);
  gain1.connect(reverb);
  gain2.connect(reverb);
  reverb.toDestination();

  // transport
  Tone.Transport.bpm.value = 70;
  Tone.Transport.start();

  components = [noise, gain1, gain2, autoFilter1, autoFilter2, reverb];

  // ui
  wind1GainDial.on("change", (v) => {
    console.log(v);
    gain1.gain.value = v;
  });
  wind2GainDial.on("change", (v) => {
    console.log(v);
    gain2.gain.value = v;
  });
  wind1FreqDial.on("change", (v) => {
    console.log(v);
    const freq = scale(v, 0, 1, 0.5, 60);
    autoFilter1.baseFrequency = freq;
  });
  wind2FreqDial.on("change", (v) => {
    console.log(v);
    const freq = scale(v, 0, 1, 0.5, 60);
    autoFilter2.baseFrequency = freq;
  });
};
