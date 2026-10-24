"use client";

import Image from "next/image";
import Link from "next/link";
import Editor from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import catalog from "./games.json";
import arrayCategories from "./categories.json";
import { initializeCatalog } from "./script.js";

const categoriesMap = [
  "Todos",
  ...new Set(arrayCategories.categories.map((game) => game)),
];
const visibleGames = catalog.games.filter(
  (game) => game.visibility !== "hidden",
);

function configureMonaco(monaco) {
  monaco.editor.defineTheme("nexus-terminal", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "string.key.json", foreground: "A3FF9C" },
      { token: "string.value.json", foreground: "8CFF7F" },
      { token: "number", foreground: "B4FF39" },
      { token: "keyword", foreground: "70D9FF" },
      { token: "delimiter.bracket", foreground: "C3F5B8" },
    ],
    colors: {
      "editor.background": "#010302",
      "editor.foreground": "#8CFF7F",
      "editorLineNumber.foreground": "#477943",
      "editorLineNumber.activeForeground": "#B4FFAE",
      "editorCursor.foreground": "#53FF45",
      "editor.selectionBackground": "#24551F",
      "editor.lineHighlightBackground": "#071007",
      "editorIndentGuide.background1": "#173117",
      "editorIndentGuide.activeBackground1": "#3B7433",
      "editorWidget.background": "#071007",
      "editorWidget.border": "#286E24",
      "editorSuggestWidget.background": "#071007",
      "editorSuggestWidget.border": "#286E24",
      "editorSuggestWidget.foreground": "#8CFF7F",
    },
  });
}

function gameHref(path) {
  if (!path) return "#";
  return path.startsWith("http") || path.startsWith("blob")
    ? path
    : `/games/${path}/index.html`;
}

export default function Home() {
  const [alanAccess, setAlanAccess] = useState("closed");
  const [alanPassword, setAlanPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [repoFile, setRepoFile] = useState("games");
  const [repoReloadVersion, setRepoReloadVersion] = useState(0);
  const [repoContent, setRepoContent] = useState("");
  const repoEditorRef = useRef(null);
  const repoFileRef = useRef(repoFile);
  const [repoView, setRepoView] = useState("editor");
  const [repoLoading, setRepoLoading] = useState(false);
  const [repoBusy, setRepoBusy] = useState(false);
  const [repoError, setRepoError] = useState("");
  const [repoNotice, setRepoNotice] = useState("");
  const [uploadFile, setUploadFile] = useState(null);

  useEffect(() => initializeCatalog(), []);

  useEffect(() => {
    repoFileRef.current = repoFile;
  }, [repoFile]);

  useEffect(() => {
    if (alanAccess !== "closed") return undefined;

    let shortcut = "";

    function handleShortcut(event) {
      if (
        !event.ctrlKey ||
        !event.altKey ||
        !event.shiftKey ||
        event.repeat ||
        event.isComposing
      ) {
        shortcut = "";
        return;
      }

      if (["Control", "Alt", "Shift", "Meta"].includes(event.key)) return;

      const key = event.key.toLowerCase();
      if (!/^[a-z]$/.test(key)) {
        shortcut = "";
        return;
      }

      shortcut += key;
      if ("alan".startsWith(shortcut)) {
        if (shortcut === "alan") {
          event.preventDefault();
          setPasswordError("");
          setAlanAccess("login");
          shortcut = "";
        }
      } else {
        shortcut = key === "a" ? "a" : "";
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [alanAccess]);

  useEffect(() => {
    if (alanAccess !== "menu" || repoView !== "editor") return undefined;

    const controller = new AbortController();
    queueMicrotask(() => {
      setRepoLoading(true);
      setRepoError("");
      setRepoNotice("");
    });

    fetch(`/api/repo?file=${repoFile}`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.error || "No se pudo leer el archivo.");
        setRepoContent(result.content);
      })
      .catch((error) => {
        if (error.name !== "AbortError") setRepoError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setRepoLoading(false);
      });

    return () => controller.abort();
  }, [alanAccess, repoFile, repoReloadVersion, repoView]);

  function closeAlanAccess() {
    fetch("/api/alan-auth", { method: "DELETE" }).catch((error) => {
      console.error("Failed to end private session:", error);
    });
    setAlanAccess("closed");
    setAlanPassword("");
    setPasswordError("");
  }

  async function saveRepoFile(
    content = repoEditorRef.current?.getValue() ?? repoContent,
    file = repoFile,
  ) {
    if (
      !window.confirm(
        `¿Guardar ${file}.json en GitHub? Se creará un commit en main.`,
      )
    ) {
      return;
    }

    setRepoBusy(true);
    setRepoError("");
    setRepoNotice("");
    try {
      const response = await fetch("/api/repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          file,
          content,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo guardar.");
      setRepoNotice(
        result.commit
          ? `Guardado. Commit: ${result.commit}`
          : "Guardado en GitHub.",
      );
    } catch (error) {
      setRepoError(error.message);
    } finally {
      setRepoBusy(false);
    }
  }

  async function uploadRepoFile(event) {
    event.preventDefault();
    if (!uploadFile) {
      setRepoError("Selecciona una imagen antes de subirla.");
      return;
    }
    if (
      !window.confirm(
        `¿Subir ${uploadFile.name} a public/? Si ya existe, se reemplazará.`,
      )
    ) {
      return;
    }

    setRepoBusy(true);
    setRepoError("");
    setRepoNotice("");
    try {
      const formData = new FormData();
      formData.set("file", uploadFile);
      const response = await fetch("/api/repo", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "No se pudo subir el archivo.");
      setRepoNotice(
        result.commit
          ? `Subido a ${result.path}. Commit: ${result.commit}`
          : `Subido a ${result.path}.`,
      );
      setUploadFile(null);
      event.currentTarget.reset();
    } catch (error) {
      setRepoError(error.message);
    } finally {
      setRepoBusy(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setIsSubmittingPassword(true);
    setPasswordError("");

    try {
      const response = await fetch("/api/alan-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: alanPassword }),
      });
      const result = await response.json();

      if (response.status === 401) {
        setPasswordError("Contraseña incorrecta. Inténtalo de nuevo.");
        return;
      }

      if (!response.ok) {
        setPasswordError(result.error || "No se pudo comprobar la contraseña.");
        return;
      }

      setAlanPassword("");
      setAlanAccess("menu");
    } catch {
      setPasswordError("No se pudo conectar con el servidor.");
    } finally {
      setIsSubmittingPassword(false);
    }
  }

  function alertGame(message) {
    return window.confirm(message) && window.confirm("¿Seguro?");
  }

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
                  {visibleGames.length.toString().padStart(2, "0")}
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
              N° 001 — {String(visibleGames.length).padStart(3, "0")}
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
            <p className="game-count">{visibleGames.length} juegos</p>
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
            {visibleGames.map((game, index) => (
              <a
                className="game-card"
                data-category={game.category}
                data-name={game.name}
                href={gameHref(game.path)}
                key={game.name}
                onClick={(event) => {
                  if (!game.alert) return;

                  event.preventDefault();
                  if (alertGame(game.alert)) {
                    window.location.assign(gameHref(game.path));
                  }
                }}
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

      {alanAccess !== "closed" && (
        <div
          className="alan-access-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeAlanAccess();
          }}
        >
          <section
            aria-labelledby="alan-access-title"
            aria-modal="true"
            className="alan-access-dialog"
            onKeyDown={(event) => {
              if (event.key === "Escape") closeAlanAccess();
            }}
            role="dialog"
          >
            <div className="terminal-titlebar">
              <div aria-hidden="true" className="terminal-controls">
                <span />
                <span />
                <span />
              </div>
              <span>alan@nexus: ~</span>
              <span className="terminal-titlebar__status">TTY1</span>
            </div>
            <div className="alan-access-heading">
              <h2 id="alan-access-title">
                {alanAccess === "login" ? "ACCESO PRIVADO" : "SESIÓN PRIVADA"}
              </h2>
              <button
                aria-label="Cerrar consola"
                className="alan-access-close"
                onClick={closeAlanAccess}
                type="button"
              >
                ×
              </button>
            </div>

            {alanAccess === "login" ? (
              <form
                className="alan-access-form"
                onSubmit={handlePasswordSubmit}
              >
                <p className="terminal-command">alan@nexus:~$ ./verify-user</p>
                <label htmlFor="alan-password">
                  Hola Alan, para saber que eres tú inserta tu contraseña:
                </label>
                <div className="terminal-input-line">
                  <label htmlFor="alan-password">Contraseña:</label>
                  <input
                    autoComplete="current-password"
                    autoFocus
                    id="alan-password"
                    onChange={(event) => {
                      setAlanPassword(event.target.value);
                      setPasswordError("");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        event.currentTarget.form?.requestSubmit();
                      }
                    }}
                    placeholder="..."
                    type="password"
                    value={alanPassword}
                    disabled={isSubmittingPassword}
                  />
                </div>
                {passwordError && (
                  <p className="alan-access-error" role="alert">
                    {passwordError}
                  </p>
                )}
                <p aria-live="polite" className="terminal-hint">
                  {isSubmittingPassword
                    ? "Verificando identidad..."
                    : "Pulsa ENTER para continuar · ESC para salir"}
                </p>
              </form>
            ) : (
              <div
                aria-label="Herramientas de API del repositorio"
                className="repo-console"
              >
                <p className="terminal-command">
                  alan@nexus:~$ repo-api --help
                </p>
                <p className="repo-console__description">
                  GitHub Contents API · alangamertorre/Poki-School · rama main
                </p>

                <nav
                  aria-label="Operaciones de la API"
                  className="repo-console__tabs"
                >
                  <button
                    aria-pressed={repoView === "editor" && repoFile === "games"}
                    className={
                      repoView === "editor" && repoFile === "games"
                        ? "active"
                        : ""
                    }
                    onClick={() => {
                      setRepoView("editor");
                      setRepoFile("games");
                    }}
                    type="button"
                  >
                    games.json
                  </button>
                  <button
                    aria-pressed={
                      repoView === "editor" && repoFile === "categories"
                    }
                    className={
                      repoView === "editor" && repoFile === "categories"
                        ? "active"
                        : ""
                    }
                    onClick={() => {
                      setRepoView("editor");
                      setRepoFile("categories");
                    }}
                    type="button"
                  >
                    categories.json
                  </button>
                  <button
                    aria-pressed={repoView === "upload"}
                    className={repoView === "upload" ? "active" : ""}
                    onClick={() => {
                      setRepoView("upload");
                      setRepoError("");
                      setRepoNotice("");
                    }}
                    type="button"
                  >
                    subir imagen
                  </button>
                </nav>

                {repoView === "editor" ? (
                  <div className="repo-console__editor">
                    <div className="repo-console__filebar">
                      <span>src/app/{repoFile}.json</span>
                      <span className="repo-console__shortcut">
                        Ctrl/Cmd + S guardar · Shift + Alt + F formatear
                      </span>
                      <button
                        disabled={repoLoading || repoBusy}
                        onClick={() =>
                          setRepoReloadVersion((value) => value + 1)
                        }
                        type="button"
                      >
                        [ RECARGAR ]
                      </button>
                    </div>
                    <div className="repo-console__monaco">
                      <Editor
                        aria-label={`Contenido de ${repoFile}.json`}
                        beforeMount={configureMonaco}
                        height="100%"
                        language="json"
                        loading={
                          <div className="repo-console__editor-loading">
                            Cargando Monaco Editor...
                          </div>
                        }
                        onChange={(value) => setRepoContent(value ?? "")}
                        onMount={(editor, monaco) => {
                          repoEditorRef.current = editor;
                          editor.addAction({
                            id: "nexus.save-json",
                            label: "Guardar JSON en GitHub",
                            keybindings: [
                              monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
                            ],
                            run: () =>
                              saveRepoFile(
                                editor.getValue(),
                                repoFileRef.current,
                              ),
                          });
                          editor.addAction({
                            id: "nexus.format-json",
                            label: "Formatear JSON",
                            keybindings: [
                              monaco.KeyMod.Shift |
                                monaco.KeyMod.Alt |
                                monaco.KeyCode.KeyF,
                            ],
                            run: () =>
                              editor
                                .getAction("editor.action.formatDocument")
                                ?.run(),
                          });
                        }}
                        options={{
                          automaticLayout: true,
                          bracketPairColorization: { enabled: true },
                          formatOnPaste: true,
                          formatOnType: true,
                          fontFamily: '"Share Tech Mono", monospace',
                          fontSize: 13,
                          insertSpaces: true,
                          minimap: { enabled: true },
                          padding: { top: 12, bottom: 12 },
                          readOnly:
                            repoLoading || repoBusy || Boolean(repoError),
                          scrollBeyondLastLine: false,
                          tabSize: 2,
                          wordWrap: "on",
                        }}
                        theme="nexus-terminal"
                        value={repoLoading ? "" : repoContent}
                      />
                    </div>
                    <button
                      className="repo-console__action"
                      disabled={repoLoading || repoBusy || Boolean(repoError)}
                      onClick={() => saveRepoFile()}
                      type="button"
                    >
                      {repoBusy
                        ? "[ ENVIANDO COMMIT... ]"
                        : "[ GUARDAR EN GITHUB ]"}
                    </button>
                  </div>
                ) : (
                  <form
                    className="repo-console__upload"
                    onSubmit={uploadRepoFile}
                  >
                    <p className="terminal-command">
                      alan@nexus:~$ upload --target public/
                    </p>
                    <label htmlFor="repo-image">
                      Archivo de imagen (AVIF, GIF, JPEG, PNG o WebP; máximo 5
                      MB)
                    </label>
                    <input
                      accept=".avif,.gif,.jpeg,.jpg,.png,.webp"
                      disabled={repoBusy}
                      id="repo-image"
                      onChange={(event) =>
                        setUploadFile(event.target.files?.[0] || null)
                      }
                      type="file"
                    />
                    <button
                      className="repo-console__action"
                      disabled={!uploadFile || repoBusy}
                      type="submit"
                    >
                      {repoBusy ? "[ SUBIENDO... ]" : "[ SUBIR A GITHUB ]"}
                    </button>
                  </form>
                )}

                {repoError && (
                  <p className="repo-console__error" role="alert">
                    {repoError}
                  </p>
                )}
                {repoNotice && (
                  <p className="repo-console__notice" role="status">
                    {repoNotice}
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
