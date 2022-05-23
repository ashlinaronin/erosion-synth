import { scale } from "./utils.js";

const createSynth = () => {
  let wind1GainDial;
  let wind2GainDial;
  let wind1FreqDial;
  let wind2FreqDial;
  let components = [];

  const createUi = () => {
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

  const dispose = () => {
    wind1GainDial.destroy();
    wind2GainDial.destroy();
    wind1FreqDial.destroy();
    wind2FreqDial.destroy();
    components.forEach((component) => component.dispose());
    components = [];
    document.getElementById("instrument").replaceChildren();
  };

  const play = () => {
    // instantiate objects
    const noise1 = new Tone.Noise("pink").start();
    const noise2 = new Tone.Noise("pink").start();
    const gain1 = new Tone.Gain(0);
    const gain2 = new Tone.Gain(0);
    const autoFilter1 = new Tone.AutoFilter({
      frequency: 0.5,
      baseFrequency: 8000,
      octaves: 8,
    }).start();
    const autoFilter2 = new Tone.AutoFilter({
      frequency: 2,
      baseFrequency: 16000,
      octaves: 4,
    }).start();
    const reverb = new Tone.Reverb({
      decay: 0.7,
      preDelay: 0.03,
      wet: 0.4,
    });

    // connect objects
    noise1.connect(autoFilter1);
    noise2.connect(autoFilter2);
    autoFilter1.connect(gain1);
    autoFilter2.connect(gain2);

    gain1.connect(reverb);
    gain2.connect(reverb);

    reverb.toDestination();

    // transport
    Tone.Transport.bpm.value = 70;
    Tone.Transport.start();

    components = [
      noise1,
      noise2,
      gain1,
      gain2,
      autoFilter1,
      autoFilter2,
      reverb,
    ];

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
      noise1.set({
        playbackRate: scale(v, 0, 1, 0.001, 0.5),
      });

      autoFilter1.set({
        frequency: scale(v, 0, 1, 0.005, 2),
      });
    });
    wind2FreqDial.on("change", (v) => {
      console.log(v);
      noise2.set({
        playbackRate: scale(v, 0, 1, 0.001, 0.5),
      });
      autoFilter2.set({
        frequency: scale(v, 0, 1, 0.005, 2),
      });
    });
  };

  return {
    createUi,
    dispose,
    play,
  };
};

export default createSynth;
