const getRandomPrompt = () =>
  prompts[Math.floor(Math.random() * prompts.length)];

const showRandomPrompt = () => {
  const prompt = getRandomPrompt();
  document.getElementById(
    "prompt-header"
  ).innerText = `${prompt.type} (${prompt.speed})`;
  document.getElementById("prompt-text").innerText = prompt.text;
};
