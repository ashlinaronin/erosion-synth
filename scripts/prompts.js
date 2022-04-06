const imageCount = 8;

const getRandomImageSrc = () => {
    const imageIndex = Math.floor(Math.random() * imageCount);
    const adjustedIndex = (imageIndex + 1).toString().padStart(2, '0');  
    return `./images/geomorph_${adjustedIndex}.jpg`
};
const getRandomPrompt = () => prompts[Math.floor(Math.random() * prompts.length)];


const showRandomPrompt = () => {
  const prompt = getRandomPrompt();
  const imageSrc = getRandomImageSrc();

  document.getElementById(
    "prompt-header"
  ).innerText = `${prompt.type} (${prompt.speed})`;
  document.getElementById("prompt-text").innerText = prompt.text;
  document.getElementById("score-image").src = imageSrc;
};
