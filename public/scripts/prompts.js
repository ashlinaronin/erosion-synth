import prompts from "./prompts-data.js";

const TOTAL_IMAGES = 13;

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
  const container = document.getElementById("score-image-container");
  const [currentImage, nextImage] = container.getElementsByTagName("img");

  nextImage.src = getImageSrc(imageIndex);
  console.log("currentImageSrc", currentImage.src);
  console.log("nextImageSrc", nextImage.src);

  currentImage.style.opacity = 0;

  await wait(1000);
  nextImage.style.opacity = 1;

  // after fade, swap next w/ current so we're ready for the next transition
  await wait(1200);
  container.appendChild(currentImage);
};

export const fadeOutImage = () => {
  const scoreImg = document.getElementById("current-image");
  scoreImg.style.opacity = 0;
};
