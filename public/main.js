const veryHappyButton = document.getElementById("veryHappy");
const happyButton = document.getElementById("happy");
const sadButton = document.getElementById("sad");
const verySadButton = document.getElementById("verySad");

const buttonsArea = document.getElementById("buttonsArea");
const resultDiv = document.getElementById("result");
const phraseBox = document.getElementById("phraseBox");

const buttons = document.querySelectorAll("button");

let veryHappyCount = 0;
let happyCount = 0;
let sadCount = 0;
let verySadCount = 0;

const clickSound = new Audio("click.m4a");

let phrases = [];
let phraseTimeout = null;
let isShowingPhrase = false;

async function loadPhrases(perSource = 5) {
  try {
    const res = await fetch(`/api/phrases?perSource=${encodeURIComponent(perSource)}`);
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.error || "Erreur lors du chargement des phrases");
    }

    phrases = json.phrases || [];
    console.log(`${phrases.length} phrases chargées`);
  } catch (error) {
    console.error("Impossible de charger les phrases :", error);
  }
}

function getRandomPhrase() {
  if (!phrases.length) return null;
  const index = Math.floor(Math.random() * phrases.length);
  return phrases[index];
}

function showRandomPhraseFor6Seconds() {
  const phrase = getRandomPhrase();

  if (!phrase) return;

  clearTimeout(phraseTimeout);

  isShowingPhrase = true;

  buttonsArea.classList.add("hidden");
  phraseBox.textContent = phrase;
  phraseBox.classList.add("visible");

  phraseTimeout = setTimeout(() => {
    phraseBox.classList.remove("visible");
    phraseBox.textContent = "";
    buttonsArea.classList.remove("hidden");
    isShowingPhrase = false;
  }, 6000);
}

function displayResults() {
  resultDiv.innerHTML = `
    <p>Very happy : ${veryHappyCount} | Happy : ${happyCount} | Sad : ${sadCount} | Very sad : ${verySadCount}</p>
  `;
}

function handleVote(type) {
  if (isShowingPhrase) return;

  if (type === "veryHappy") veryHappyCount++;
  if (type === "happy") happyCount++;
  if (type === "sad") sadCount++;
  if (type === "verySad") verySadCount++;

  displayResults();
  showRandomPhraseFor6Seconds();
}

veryHappyButton.addEventListener("click", () => handleVote("veryHappy"));
happyButton.addEventListener("click", () => handleVote("happy"));
sadButton.addEventListener("click", () => handleVote("sad"));
verySadButton.addEventListener("click", () => handleVote("verySad"));

buttons.forEach((button) => {
  button.addEventListener("pointerdown", () => {
    if (isShowingPhrase) return;

    button.classList.add("pressed");
    clickSound.currentTime = 0;
    clickSound.play();
  });

  button.addEventListener("pointerup", () => {
    button.classList.remove("pressed");
  });

  button.addEventListener("pointerleave", () => {
    button.classList.remove("pressed");
  });
});

displayResults();
loadPhrases(5);