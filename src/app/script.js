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

export function backgroundCursor(container) {
  if (!(container instanceof HTMLElement)) return () => {};

  const originalBackgroundImage = container.style.backgroundImage;
  const targetSelector =
    ".game-card, .category-button, .search-box, .hero-art__frame";
  const activeTargets = new Set();
  const proximityRadius = 150;
  let pointerX = 0;
  let pointerY = 0;
  let pointerIsInside = false;
  let animationFrame = null;

  function clearActiveTargets() {
    activeTargets.forEach((target) => {
      target.classList.remove("cursor-border-active");
      target.style.removeProperty("--border-x");
      target.style.removeProperty("--border-y");
    });
    activeTargets.clear();
  }

  function updateCursorEffect() {
    animationFrame = null;
    if (!pointerIsInside) return;

    const containerBounds = container.getBoundingClientRect();
    const cursorX = pointerX - containerBounds.left;
    const cursorY = pointerY - containerBounds.top;
    container.style.backgroundImage = `radial-gradient(circle 180px at ${cursorX}px ${cursorY}px, #b3ff3954, transparent 50%)`;

    const nearbyTargets = new Set();
    container.querySelectorAll(targetSelector).forEach((target) => {
      const bounds = target.getBoundingClientRect();
      const targetX = Math.max(bounds.left, Math.min(pointerX, bounds.right));
      const targetY = Math.max(bounds.top, Math.min(pointerY, bounds.bottom));
      const distance = Math.hypot(pointerX - targetX, pointerY - targetY);

      if (distance > proximityRadius) return;

      nearbyTargets.add(target);
      target.classList.add("cursor-border-active");
      target.style.setProperty("--border-x", `${pointerX - bounds.left}px`);
      target.style.setProperty("--border-y", `${pointerY - bounds.top}px`);
    });

    activeTargets.forEach((target) => {
      if (!nearbyTargets.has(target)) {
        target.classList.remove("cursor-border-active");
        target.style.removeProperty("--border-x");
        target.style.removeProperty("--border-y");
      }
    });

    activeTargets.clear();
    nearbyTargets.forEach((target) => activeTargets.add(target));
  }

  function scheduleCursorEffect() {
    if (animationFrame === null) {
      animationFrame = window.requestAnimationFrame(updateCursorEffect);
    }
  }

  function handlePointerMove(event) {
    pointerX = event.clientX;
    pointerY = event.clientY;
    pointerIsInside = container.contains(
      document.elementFromPoint(pointerX, pointerY),
    );
    scheduleCursorEffect();
  }

  function handleScroll() {
    scheduleCursorEffect();
  }

  function handlePointerLeave() {
    pointerIsInside = false;
    if (animationFrame !== null) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    clearActiveTargets();
    container.style.backgroundImage = originalBackgroundImage;
  }

  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("scroll", handleScroll, true);
  window.addEventListener("resize", handleScroll);

  return () => {
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("scroll", handleScroll, true);
    window.removeEventListener("resize", handleScroll);
    handlePointerLeave();
  };
}
