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
  return path.startsWith("http") || path.startsWith("blob")
    ? path
    : `/games/${path}/index.html`;
}

export default function Home() {
  useEffect(() => initializeCatalog(), []);

  return (
    <div className="site-shell">
      <div className="boot-mask" aria-hidden="true">
        <div className="boot-mask__content">
          <span className="brand-mark brand-mark--boot">&gt;_</span>
          <span className="boot-label">INICIANDO NEXUS</span>
          <span className="boot-line" />
        </div>
      </div>

      <header className="site-header">
        <Link className="brand" href="/" aria-label="NEXUS Play, inicio">
          <span className="brand-mark" aria-hidden="true">
            &gt;_
          </span>
          <span className="brand-name">
            NEXUS<span>{"//"}</span>PLAY
          </span>
        </Link>

        <div className="header-status">
          <span className="status-dot" />
          <span>SISTEMA EN LÍNEA</span>
        </div>

        <div className="header-tools">
          <a className="header-link" href="#catalog">
            EXPLORAR
          </a>
          <label className="search-box">
            <span>Buscar juegos</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 5 5" />
            </svg>
            <input
              type="search"
              placeholder="Buscar en el sistema..."
              aria-label="Buscar un juego"
            />
            <kbd>/</kbd>
          </label>
        </div>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="eyebrow-mark" />
              PORTAL DE JUEGOS // ACCESO LIBRE
            </p>
            <h1 id="hero-title">
              TU PRÓXIMA
              <br />
              <span>PARTIDA</span> EMPIEZA AQUÍ
            </h1>
            <p className="hero-description">
              Juega desde clase a lo que tu quieras. Este hub te lo da todo, ten
              cuidado de que no te pillen en clase.
            </p>
            <a className="hero-cta" href="#catalog">
              <span>ENTRAR AL ARCADE</span>
              <span className="cta-arrow" aria-hidden="true">
                ↘
              </span>
            </a>
            <div className="hero-meta">
              <span>
                <strong>
                  {catalog.games.length.toString().padStart(2, "0")}
                </strong>{" "}
                JUEGOS DISPONIBLES
              </span>
              <span className="meta-divider" />
              <span>NINGUNA DESCARGA REQUERIDA</span>
            </div>
          </div>

          <div className="hero-art">
            <div className="hero-art__frame">
              <Image
                className="hero-art__image"
                src="/geometry.png"
                alt=""
                fill
                priority
                sizes="(max-width: 760px) 90vw, 48vw"
              />
              <div className="hero-art__overlay" />
              <div className="hero-art__topline">
                <span>SEÑAL // 001</span>
                <span className="live-indicator">
                  <span /> LIVE
                </span>
              </div>
              <div className="hero-art__caption">
                <span>DESTACADO DEL SISTEMA</span>
                <strong>GEOMETRY DASH</strong>
              </div>
              <span className="hero-art__crosshair" aria-hidden="true">
                +
              </span>
            </div>
            <span className="art-index">
              N° 001 — {String(catalog.games.length).padStart(3, "0")}
            </span>
          </div>

          <span className="hero-coordinate" aria-hidden="true">
            40° 25&apos; 01.2&quot; N&nbsp; / &nbsp;03° 42&apos; 11.5&quot; W
          </span>
        </section>

        <section className="catalog-section" id="catalog">
          <div className="catalog-heading">
            <div>
              <p className="section-kicker">01 / SELECCIÓN DE JUEGOS</p>
              <h2>
                EXPLORA EL <span>CATÁLOGO</span>
              </h2>
            </div>
            <p className="game-count">{catalog.games.length} juegos</p>
          </div>

          <nav className="category-list" aria-label="Filtrar por categoría">
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
                {category === "Todos" && (
                  <span className="category-hash" aria-hidden="true">
                    #
                  </span>
                )}
                {category}
              </button>
            ))}
          </nav>

          <section className="games-grid" aria-label="Catálogo de juegos">
            {catalog.games.map((game, index) => (
              <a
                className="game-card"
                data-category={game.category}
                data-name={game.name}
                href={gameHref(game.path)}
                key={game.name}
                style={{ "--card-index": index }}
              >
                <div className="game-card__image-wrap">
                  <Image
                    src={`/${game.img}`}
                    alt={game.name}
                    width={500}
                    height={600}
                    loading="lazy"
                  />
                  <span className="game-card__number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="game-card__play" aria-hidden="true">
                    <Image
                      src="/open_tab.png"
                      alt="open tab"
                      width={24}
                      height={24}
                    />
                  </span>
                </div>
                <div className="game-card__info">
                  <span className="game-category">{game.category}</span>
                  <h3>{game.name}</h3>
                </div>
              </a>
            ))}
          </section>

          <p className="empty-state" hidden>
            No encontramos juegos con esa búsqueda.
          </p>
        </section>
      </main>

      <footer className="site-footer">
        <Link className="footer-brand" href="/">
          NEXUS<span>{"//"}</span>PLAY
        </Link>
        <span>UN PORTAL. INFINITAS PARTIDAS.</span>
        <span className="footer-status">
          <span className="status-dot" /> CONEXIÓN ESTABLE
        </span>
      </footer>
    </div>
  );
}
