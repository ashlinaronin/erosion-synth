import prompts from "./prompts-data.js";
import { TOTAL_IMAGES } from "../sharedConstants.js";

let currentSynth = null;

const getRandomPrompt = () =>
  prompts[Math.floor(Math.random() * prompts.length)];

export const loadSynth = async (synthName) => {
  currentSynth?.dispose();
  currentSynth = null;
  currentSynth = await import(`./synths/${synthName}.js`);
  await currentSynth.createUi();
  await currentSynth.play();
};

export const showRandomPrompt = () => {
  currentSynth?.dispose();
  currentSynth = null;

  const prompt = getRandomPrompt();

  document.getElementById(
    "prompt-header"
  ).innerText = `${prompt.type} (${prompt.speed})`;
  document.getElementById("prompt-text").innerText = prompt.text;

  if (prompt.type === "ice") {
    console.log("use grainfields, not loading a synth...");
    return;
  }

  if (prompt.type !== "none") {
    loadSynth(prompt.type);
  }
};

export const getImageSrc = (imageIndex) => {
  const adjustedIndex = (imageIndex + 1).toString().padStart(2, "0");
  return `./images/geomorph_${adjustedIndex}.jpg`;
};

export const preloadImages = () => {
  for (let i = 0; i < TOTAL_IMAGES; i++) {
    const img = new Image();
    img.src = getImageSrc(i);
  }
};

const wait = async (ms) =>
  new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve();
      clearTimeout(timeout);
    }, ms);
  });

export const showImage = async (imageIndex) => {
  console.log("showImage");
  const scoreImg = document.getElementById("score-image");
  scoreImg.style.opacity = 0;
  console.log("opacity set to 0");
  await wait(1000);
  scoreImg.src = getImageSrc(imageIndex);
  console.log("src set");
  await wait(100);
  scoreImg.style.opacity = 1;
  console.log("opacity set to 1");
};

export const fadeOutImage = () => {
  const scoreImg = document.getElementById("score-image");
  scoreImg.style.opacity = 0;
};
