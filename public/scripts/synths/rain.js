// todo: nexus also offers same util
import { scale } from "./utils.js";

const createSynth = () => {
  let rainPad;
  let components = [];

  const createUi = () => {
    rainPad = Nexus.Add.Position("#instrument", {
      size: [400, 400],
    });
  };

  const dispose = () => {
    rainPad.destroy();
    components.forEach((component) => component.dispose());
    components = [];
    document.getElementById("instrument").replaceChildren();
  };

  const play = () => {
    // instantiate objects
    const raindropSynth = new Tone.MembraneSynth({
      pitchDecay: 0.508,
      octaves: 4,
      envelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0,
        release: 0.4,
      },
    });
    const metalSynth = new Tone.MetalSynth({
      harmonicity: 12,
      resonance: 800,
      modulationIndex: 20,
      envelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0,
        release: 0.3,
      },
      volume: -24,
    });
    const raindropCombFilter = new Tone.FeedbackCombFilter(0.0283, 0.45);
    const reverb = new Tone.Reverb({
      decay: 0.7,
      preDelay: 0.03,
      wet: 0.4,
    });

    // connect objects
    metalSynth.connect(raindropCombFilter);
    raindropSynth.connect(raindropCombFilter);
    // raindropCombFilter.toDestination();
    raindropCombFilter.connect(reverb);
    reverb.toDestination();

    // transport
    Tone.Transport.start();

    components = [raindropSynth, metalSynth, raindropCombFilter, reverb];

    // ui
    const debouncedXyHandler = _.debounce(({ x, y }) => {
      console.log(x, y);
      const freq = scale(x, 0, 1, 200, 400);
      const pitchDecay = scale(y, 0, 1, 3, 6);
      const resonance = scale(x, 0, 1, 200, 800);
      const harmonicity = scale(x, 0, 1, 0.1, 10);
      const modIndex = scale(y, 0, 1, 1, 100);

      raindropSynth.pitchDecay = pitchDecay;
      metalSynth.harmonicity = harmonicity;
      metalSynth.resonance = resonance;
      metalSynth.modulationIndex = modIndex;

      const timeOffset = `+${Math.random() * 0.05 + 0.05}`;

      raindropSynth.triggerAttackRelease(freq, "16n", timeOffset);
      metalSynth.triggerAttackRelease("16n", timeOffset);
    }, 10);

    rainPad.on("change", debouncedXyHandler);
  };

  return {
    createUi,
    dispose,
    play,
  };
};

export default createSynth;