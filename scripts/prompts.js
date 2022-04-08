import prompts from "./prompts-data.js";

const imageCount = 8;
let currentSynth = null;

const getRandomImageSrc = () => {
  const imageIndex = Math.floor(Math.random() * imageCount);
  const adjustedIndex = (imageIndex + 1).toString().padStart(2, "0");
  return `./images/geomorph_${adjustedIndex}.jpg`;
};

const getRandomPrompt = () =>
  prompts[Math.floor(Math.random() * prompts.length)];

const loadSynth = async (synthName) => {
  currentSynth = await import(`./synths/${synthName}.js`);
  await currentSynth.createUi();
  await currentSynth.play();
};

const showRandomPrompt = () => {
  currentSynth?.dispose();
  currentSynth = null;

  const prompt = getRandomPrompt();
  const imageSrc = getRandomImageSrc();

  document.getElementById(
    "prompt-header"
  ).innerText = `${prompt.type} (${prompt.speed})`;
  document.getElementById("prompt-text").innerText = prompt.text;
  document.getElementById("score-image").src = imageSrc;

  if (prompt.type === "ice") {
    console.log("use grainfields, not loading a synth...");
    return;
  }

  if (prompt.type !== "none") {
    loadSynth(prompt.type);
  }
};

export default showRandomPrompt;
