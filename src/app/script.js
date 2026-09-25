export function initializeCatalog() {
  const categoryButtons = [...document.querySelectorAll(".category-button")];
  const gameCards = [...document.querySelectorAll(".game-card")];
  const searchInput = document.querySelector(".search-box input");
  const gameCount = document.querySelector(".game-count");
  const emptyState = document.querySelector(".empty-state");

  let activeCategory = "Todos";

  // Evento para los botones de categoría
  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;
      filterGames();

      document
        .querySelectorAll(".category-button.active")
        .forEach((activeButton) => activeButton.classList.remove("active"));
      button.classList.add("active");
    });
  });

  // Evento para la barra de búsqueda (por texto)
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      filterGames();
    });
  }

  // Función única de filtrado combinado
  function filterGames() {
    let count = 0;
    const searchText = searchInput
      ? searchInput.value.toLowerCase().trim()
      : "";

    gameCards.forEach((card) => {
      const matchesCategory =
        activeCategory === "Todos" || card.dataset.category === activeCategory;

      const gameTitle = (card.dataset.name || "").toLowerCase();
      const matchesSearch = gameTitle.includes(searchText);

      // Si cumple ambas condiciones, se muestra
      if (matchesCategory && matchesSearch) {
        card.style.display = "flex";
        count++;
      } else {
        card.style.display = "none";
      }
    });

    // Actualizar el contador de juegos
    if (gameCount) {
      gameCount.textContent = `${count} ${count === 1 ? "juego" : "juegos"}`;
    }

    // Mostrar/ocultar el estado vacío si no hay resultados
    if (emptyState) {
      emptyState.style.display = count === 0 ? "block" : "none";
    }
  }
}
