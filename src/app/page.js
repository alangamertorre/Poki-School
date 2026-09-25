"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import catalog from "./games.json";
import arrayCategories from "./categories.json";
import { initializeCatalog } from "./script.js";

const categoriesMap = [
  "Todos",
  ...new Set(arrayCategories.categories.map((game) => game)),
];

function gameHref(path) {
  if (!path) return "#";
  return path.startsWith("http") ? path : `/games/${path}/index.html`;
}

export default function Home() {
  useEffect(() => initializeCatalog(), []);
  return (
    <div className="site-shell">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Poki School, inicio">
          <Image src="/poki.svg" alt="" width={84} height={52} priority />
          <span>Poki School</span>
        </Link>
        <div className="header-tools">
          <Link
            className="home-button"
            href="/"
            aria-label="Volver al inicio"
            title="Inicio"
          >
            <Image src="/house.svg" alt="" width={24} height={24} />
          </Link>
          <label className="search-box">
            <span>Buscar juegos</span>
            <input
              type="search"
              placeholder="Buscar un juego..."
              aria-label="Buscar un juego"
            />
          </label>
        </div>
      </header>

      <main className="catalog-main">
        <div className="catalog-heading">
          <div>
            <p className="eyebrow">Tu recreo digital</p>
            <h1>Elige un juego</h1>
          </div>
          <p className="game-count">{catalog.games.length} juegos</p>
        </div>

        <nav className="category-list" aria-label="Categorías">
          {categoriesMap.map((category) => (
            <button
              className={
                category === "Todos"
                  ? "category-button active"
                  : "category-button"
              }
              data-category={category}
              aria-pressed={category === "Todos"}
              key={category}
              type="button"
            >
              {category}
            </button>
          ))}
        </nav>

        <section className="games-grid" aria-label="Catálogo de juegos">
          {catalog.games.map((game) => (
            <a
              className="game-card"
              data-category={game.category}
              data-name={game.name}
              href={gameHref(game.path)}
              key={game.name}
            >
              <Image
                src={`/${game.img}`}
                alt={game.name}
                width={250}
                height={300}
              />
              <span className="game-category">{game.category}</span>
              <h2>{game.name}</h2>
            </a>
          ))}
        </section>

        <p className="empty-state" hidden>
          No encontramos juegos con esa búsqueda.
        </p>
      </main>
    </div>
  );
}
