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

let phrases = [];
let phraseTimeout = null;
let isShowingPhrase = false;

const clickSound = new Audio("./click.mp3");

const SOURCES = [
  { subreddit: "ProductivityApps" },
  { subreddit: "productivity" },
  { subreddit: "labubu" },
  { subreddit: "getdisciplined" },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalizeTitle(text) {
  return text.replace(/\s+/g, " ").trim();
}

async function fetchSubredditTitles(subreddit, limit = 10) {
  const url = `https://www.reddit.com/r/${subreddit}/new.json?limit=${limit}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Erreur ${res.status} pour r/${subreddit}`);
  }

  const json = await res.json();

  return (json?.data?.children || [])
    .map((item) => item?.data?.title || "")
    .map(normalizeTitle)
    .filter(Boolean);
}

async function loadPhrases() {
  try {
    const allLists = await Promise.allSettled(
      SOURCES.map((src) => fetchSubredditTitles(src.subreddit, 10))
    );

    const allTitles = allLists
      .filter((result) => result.status === "fulfilled")
      .flatMap((result) => result.value);

    // supprimer doublons
    const uniqueTitles = [...new Set(allTitles)];

    phrases = shuffle(uniqueTitles);

    console.log(`${phrases.length} phrases chargées`);
  } catch (error) {
    console.error("Erreur lors du chargement des phrases :", error);
    phrases = [];
  }
}

function getRandomPhrase() {
  if (!phrases.length) return null;
  const index = Math.floor(Math.random() * phrases.length);
  return phrases[index];
}

function showRandomPhraseFor6Seconds() {
  const phrase = getRandomPhrase();

  if (!phrase) {
    phraseBox.textContent = "Aucune phrase disponible.";
    phraseBox.classList.add("visible");
    buttonsArea.classList.add("hidden");

    clearTimeout(phraseTimeout);
    phraseTimeout = setTimeout(() => {
      phraseBox.classList.remove("visible");
      phraseBox.textContent = "";
      buttonsArea.classList.remove("hidden");
      isShowingPhrase = false;
    }, 6000);

    return;
  }

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
    clickSound.play().catch(() => {});
  });

  button.addEventListener("pointerup", () => {
    button.classList.remove("pressed");
  });

  button.addEventListener("pointerleave", () => {
    button.classList.remove("pressed");
  });
});

displayResults();
loadPhrases();