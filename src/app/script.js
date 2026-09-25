export function initializeCatalog() {
  const categoryButtons = [...document.querySelectorAll(".category-button")];
  const gameCards = [...document.querySelectorAll(".game-card")];
  const searchInput = document.querySelector(".search-box input");
  const gameCount = document.querySelector(".game-count");
  const emptyState = document.querySelector(".empty-state");
  let activeCategory = "Todos";

  function updateCatalog() {
    const query = searchInput?.value.trim().toLowerCase() ?? "";
    let visibleCount = 0;

    gameCards.forEach((card) => {
      const matchesCategory =
        activeCategory === "Todos" || card.dataset.category === activeCategory;
      const searchableText =
        `${card.dataset.name} ${card.dataset.category}`.toLowerCase();
      const matchesSearch = !query || searchableText.includes(query);
      const isVisible = matchesCategory && matchesSearch;

      card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    if (gameCount) gameCount.textContent = `${visibleCount} juegos`;
    if (emptyState) emptyState.hidden = visibleCount !== 0;
  }

  function handleCategoryClick(event) {
    activeCategory = event.currentTarget.dataset.category;
    categoryButtons.forEach((button) => {
      const isActive = button === event.currentTarget;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    updateCatalog();
  }

  categoryButtons.forEach((button) => {
    button.addEventListener("click", handleCategoryClick);
  });
  searchInput?.addEventListener("input", updateCatalog);
  updateCatalog();

  return () => {
    categoryButtons.forEach((button) => {
      button.removeEventListener("click", handleCategoryClick);
    });
    searchInput?.removeEventListener("input", updateCatalog);
  };
}
