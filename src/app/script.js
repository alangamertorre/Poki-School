export function initializeCatalog() {
  const categoryButtons = [...document.querySelectorAll(".category-button")];
  const gameCards = [...document.querySelectorAll(".game-card")];
  const searchInput = document.querySelector(".search-box input");
  const gameCount = document.querySelector(".game-count");
  const emptyState = document.querySelector(".empty-state");

  let activeCategory = "Todos";

  function handleCategoryClick(event) {
    const selectedButton = event.currentTarget;
    activeCategory = selectedButton.dataset.category;
    filterGames();

    categoryButtons.forEach((button) => {
      const isActive = button === selectedButton;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function handleSearchInput() {
    filterGames();
  }

  categoryButtons.forEach((button) => {
    button.addEventListener("click", handleCategoryClick);
  });

  if (searchInput) {
    searchInput.addEventListener("input", handleSearchInput);
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

  return () => {
    categoryButtons.forEach((button) => {
      button.removeEventListener("click", handleCategoryClick);
    });
    searchInput?.removeEventListener("input", handleSearchInput);
  };
}
