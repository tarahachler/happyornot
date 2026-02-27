//click sur un bouton, enregistrer le choix dans une variable, puis afficher le résultat au bas de la page

// Récupérer les éléments du DOM
const veryHappyButton = document.getElementById('veryHappy');
const happyButton = document.getElementById('happy');
const sadButton = document.getElementById('sad');
const verySadButton = document.getElementById('verySad');
const resultDiv = document.getElementById('result');

let veryHappyCount = 0;
let happyCount = 0;
let sadCount = 0;
let verySadCount = 0;

// Ajouter des écouteurs d'événements aux boutons
veryHappyButton.addEventListener('click', () => {
    veryHappyCount++;
});

happyButton.addEventListener('click', () => {
    happyCount++;
});

sadButton.addEventListener('click', () => {
    sadCount++;
});

verySadButton.addEventListener('click', () => {
    verySadCount++;
});   

// Afficher les résultats
function displayResults() {
    resultDiv.innerHTML = `
        <p>Very happy : ${veryHappyCount} | Happy : ${happyCount} | Sad : ${sadCount} | Very sad : ${verySadCount}</p>
    `;
}

// Mettre à jour les résultats après chaque clic
happyButton.addEventListener('click', displayResults);
veryHappyButton.addEventListener('click', displayResults);
sadButton.addEventListener('click', displayResults);
verySadButton.addEventListener('click', displayResults);