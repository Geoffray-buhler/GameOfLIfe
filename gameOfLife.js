const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const resolution = 10; // Taille d'une cellule
const COLS = canvas.width / resolution;
const ROWS = canvas.height / resolution;

let grid = buildGrid();
let running = false;
let animationFrame;
let savedElements = []; // Pour stocker les éléments créés

// Crée une grille vide
function buildGrid() {
  return new Array(ROWS).fill(null).map(() => new Array(COLS).fill(0));
}

// Dessine la grille et les cellules
function renderGrid() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = grid[row][col];
      ctx.beginPath();
      ctx.rect(col * resolution, row * resolution, resolution, resolution);
      ctx.fillStyle = cell ? 'white' : 'black';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.stroke();
    }
  }
}

// Met à jour les cellules selon les règles du jeu
function nextGen(grid) {
  const newGrid = grid.map(arr => [...arr]);

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const cell = grid[row][col];
      let numNeighbors = 0;
      for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
          if (i === 0 && j === 0) continue;
          const x_cell = row + i;
          const y_cell = col + j;

          if (x_cell >= 0 && y_cell >= 0 && x_cell < ROWS && y_cell < COLS) {
            numNeighbors += grid[x_cell][y_cell];
          }
        }
      }

      // Règles du jeu de la vie
      if (cell === 1 && (numNeighbors < 2 || numNeighbors > 3)) {
        newGrid[row][col] = 0;
      } else if (cell === 0 && numNeighbors === 3) {
        newGrid[row][col] = 1;
      }
    }
  }
  return newGrid;
}

// Animation frame pour mettre à jour la grille continuellement
function update() {
  grid = nextGen(grid);
  renderGrid();
  if (running) {
    animationFrame = requestAnimationFrame(update);
  }
}

// Démarre ou arrête l'animation du jeu
document.getElementById("startPauseBtn").addEventListener("click", () => {
  running = !running;
  if (running) {
    update();
    document.getElementById("startPauseBtn").textContent = "Pause";
  } else {
    cancelAnimationFrame(animationFrame);
    document.getElementById("startPauseBtn").textContent = "Start";
  }
});

// Réinitialise la grille à vide
document.getElementById("clearBtn").addEventListener("click", () => {
  grid = buildGrid();
  renderGrid();
  if (running) {
    cancelAnimationFrame(animationFrame);
    running = false;
    document.getElementById("startPauseBtn").textContent = "Start";
  }
});

// Ajoute un écouteur d'événement pour changer l'état des cellules sur clic
canvas.addEventListener("click", (event) => {
  const col = Math.floor(event.offsetX / resolution);
  const row = Math.floor(event.offsetY / resolution);
  grid[row][col] = grid[row][col] ? 0 : 1; // Inverse l'état
  renderGrid();
});

// Initialise la grille à l'affichage
renderGrid();

// *** Modal et création d'éléments personnalisés ***

const modal = document.getElementById("modal");
const overlay = document.getElementById("overlay");
const gridSizeInput = document.getElementById("gridSize");
const creationGridDiv = document.getElementById("creationGrid");
const closeBtn = document.getElementById("closeBtn");
let creationGrid = [];
let creationGridSize = 5;
let limit = 30;


closeBtn.addEventListener("click", () => {
  closeModal();
})

// Ouvre le modal
document.getElementById("createElementBtn").addEventListener("click", () => {
  if (creationGridSize > limit) {
    creationGridSize = 5;
  }
  openModal();
});

// Ouvre le modal et initialise la grille de création
function openModal() {
  creationGridSize = Math.min(parseInt(gridSizeInput.value), limit);
  createCreationGrid();
  modal.style.display = "block";
  overlay.style.display = "block";
}

// Crée la grille pour créer l'élément personnalisé
function createCreationGrid() {
  creationGridDiv.innerHTML = ''; // Clear previous grid
  creationGrid = new Array(creationGridSize).fill(null).map(() => new Array(creationGridSize).fill(0));

  for (let row = 0; row < creationGridSize; row++) {
    const rowDiv = document.createElement("div");
    for (let col = 0; col < creationGridSize; col++) {
      const cellDiv = document.createElement("div");
      cellDiv.style.display = "inline-block";
      cellDiv.style.width = "20px";
      cellDiv.style.height = "20px";
      cellDiv.style.border = "1px solid white";
      cellDiv.style.backgroundColor = "black";
      cellDiv.addEventListener("click", () => {
        creationGrid[row][col] = creationGrid[row][col] ? 0 : 1;
        cellDiv.style.backgroundColor = creationGrid[row][col] ? "white" : "black";
      });
      rowDiv.appendChild(cellDiv);
    }
    creationGridDiv.appendChild(rowDiv);
  }
}

const closeModal = () => {
  modal.style.display = "none";
  overlay.style.display = "none";
}

// Ferme le modal
overlay.addEventListener("click", () => {
  closeModal();
});

gridSizeInput.addEventListener("change", (e) => {
  if (e.target.value > limit) {
    msg.innerText = "La valeur saisie dépasse la limite autorisée de 30.";
    msg.classList.add("error");
    msg.classList.remove("d-none");
    setTimeout(() => {
      msg.classList.add("d-none");
    },6000)
  }else{
    creationGridSize = e.target.value;
    openModal();
  }
})

// Sauvegarde l'élément et l'ajoute à la liste sur la droite
document.getElementById("saveElementBtn").addEventListener("click", () => {
  const newElement = creationGrid.map(row => [...row]); // Copie la grille de création
  savedElements.push(newElement);
  updateElementsList();
  modal.style.display = "none";
  overlay.style.display = "none";
});

// Met à jour la liste d'éléments sauvegardés
function updateElementsList() {
  const elementsListDiv = document.getElementById("elementsList");
  elementsListDiv.innerHTML = ''; // Clear list

  savedElements.forEach((element, index) => {
    const elementDiv = document.createElement("div");
    elementDiv.classList.add("saved-element");
    elementDiv.textContent = `Element ${index + 1}`;
    elementDiv.addEventListener("click", () => {
      placeElementOnGrid(element);
    });
    elementsListDiv.appendChild(elementDiv);
  });
}

// Place l'élément sélectionné sur la grille principale
function placeElementOnGrid(element) {
  const startRow = Math.floor(ROWS / 2) - Math.floor(element.length / 2);
  const startCol = Math.floor(COLS / 2) - Math.floor(element[0].length / 2);

  for (let row = 0; row < element.length; row++) {
    for (let col = 0; col < element[row].length; col++) {
      if (startRow + row >= 0 && startRow + row < ROWS && startCol + col >= 0 && startCol + col < COLS) {
        grid[startRow + row][startCol + col] = element[row][col];
      }
    }
  }
  renderGrid();
}

canvas.addEventListener("mousemove", (event) => {
    if (selectedElement) {
      const col = Math.floor(event.offsetX / resolution);
      const row = Math.floor(event.offsetY / resolution);
      previewPosition = { row, col };
      renderGrid(); // Rerendre la grille pour mettre à jour la prévisualisation
      previewElementOnGrid(selectedElement, row, col); // Affiche l'élément en gris clair
    }
  });

  // Variables globales pour la gestion du placement des éléments
let isPlacingElement = false;
let selectedElement = null;
let previewPosition = { row: 0, col: 0 };

// Événement 'mousemove' pour la prévisualisation d'un élément sélectionné
canvas.addEventListener("mousemove", (event) => {
  if (selectedElement) {
    const col = Math.floor(event.offsetX / resolution);
    const row = Math.floor(event.offsetY / resolution);
    previewPosition = { row, col };
    renderGrid(); // Rerendre la grille pour mettre à jour la prévisualisation
    previewElementOnGrid(selectedElement, row, col); // Affiche l'élément en gris clair
  }
});

// Événement 'click' pour placer l'élément définitivement sur la grille
canvas.addEventListener("click", (event) => {
  if (selectedElement) {
    const col = Math.floor(event.offsetX / resolution);
    const row = Math.floor(event.offsetY / resolution);
    placeElementOnGrid(selectedElement, row, col); // Place l'élément sélectionné
    selectedElement = null; // Annule la sélection après placement
    isPlacingElement = false; // Réinitialise l'état de placement
  }
});

// Fonction pour mettre à jour la liste des éléments et gérer leur sélection
function updateElementsList() {
  const elementsListDiv = document.getElementById("elementsList");
  elementsListDiv.innerHTML = ''; // Vide la liste avant de la remplir

  savedElements.forEach((element, index) => {
    const elementDiv = document.createElement("div");
    elementDiv.classList.add("saved-element");
    elementDiv.textContent = `Element ${index + 1}`;
    
    // Sélectionner un élément pour la prévisualisation et le placement
    elementDiv.addEventListener("click", () => {
      selectedElement = element;
      isPlacingElement = true; // Active le mode placement
    });
    
    elementsListDiv.appendChild(elementDiv); // Ajoute l'élément à la liste
  });
}

// Fonction pour prévisualiser l'élément sur la grille en gris clair avant placement
function previewElementOnGrid(element, row, col) {
  const previewColor = 'rgba(200, 200, 200, 0.7)'; // Couleur gris clair pour la prévisualisation

  for (let i = 0; i < element.length; i++) {
    for (let j = 0; j < element[i].length; j++) {
      if (element[i][j] === 1) {
        const x = col + j;
        const y = row + i;
        if (x >= 0 && y >= 0 && x < COLS && y < ROWS) {
          ctx.fillStyle = previewColor;
          ctx.fillRect(x * resolution, y * resolution, resolution, resolution);
        }
      }
    }
  }
}

// Fonction pour placer définitivement l'élément sur la grille
function placeElementOnGrid(element, startRow, startCol) {
  for (let row = 0; row < element.length; row++) {
    for (let col = 0; col < element[row].length; col++) {
      if (startRow + row >= 0 && startRow + row < ROWS && startCol + col >= 0 && startCol + col < COLS) {
        grid[startRow + row][startCol + col] = element[row][col]; // Met à jour la grille principale
      }
    }
  }
  renderGrid(); // Rafraîchit la grille avec l'élément placé
}
