const REPOSITORY = "alangamertorre/Poki-School";
const CONTENTS_API = `https://api.github.com/repos/${REPOSITORY}/contents`;
const EDITABLE_FILES = new Set([
  "src/app/games.json",
  "src/app/categories.json",
]);

function githubHeaders() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("Configura GITHUB_TOKEN en las variables del servidor.");
  }

  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function fileUrl(path) {
  const encodedPath = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${CONTENTS_API}/${encodedPath}`;
}

async function readRepositoryFile(path) {
  const response = await fetch(`${fileUrl(path)}?ref=main`, {
    headers: githubHeaders(),
    cache: "no-store",
  });

  if (response.status === 404) {
    throw new Error("El archivo no existe en la rama main.");
  }
  if (!response.ok) {
    throw new Error(`GitHub no pudo leer el archivo (HTTP ${response.status}).`);
  }

  const file = await response.json();
  if (typeof file.content !== "string" || file.encoding !== "base64") {
    throw new Error("GitHub devolvió un formato de archivo no compatible.");
  }

  return {
    content: Buffer.from(file.content.replace(/\s/g, ""), "base64").toString(
      "utf8",
    ),
    sha: file.sha,
  };
}

async function commitRepositoryFile(path, content, message) {
  const currentFile = await readRepositoryFile(path);
  const response = await fetch(fileUrl(path), {
    method: "PUT",
    headers: {
      ...githubHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(content, "utf8").toString("base64"),
      sha: currentFile.sha,
      branch: "main",
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub no pudo guardar el archivo (HTTP ${response.status}).`);
  }

  return response.json();
}

export async function writeGamesFile(newText) {
  return commitRepositoryFile(
    "src/app/games.json",
    newText,
    "Actualizar catálogo de juegos desde NEXUS//PLAY",
  );
}

export async function writeCategoriesFile(newText) {
  return commitRepositoryFile(
    "src/app/categories.json",
    newText,
    "Actualizar categorías desde NEXUS//PLAY",
  );
}

export async function leerArchivoDeGitHub(path) {
  if (!EDITABLE_FILES.has(path)) {
    throw new Error("Solo se permite leer games.json o categories.json.");
  }
  return (await readRepositoryFile(path)).content;
}

export async function subirArchivoAPublic(fileBuffer, nombreArchivo) {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/.test(nombreArchivo)) {
    throw new Error("Nombre de archivo no válido.");
  }

  const path = `public/${nombreArchivo}`;
  const url = fileUrl(path);
  let sha;

  try {
    sha = (await readRepositoryFile(path)).sha;
  } catch (error) {
    if (error.message !== "El archivo no existe en la rama main.") {
      throw error;
    }
  }

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      ...githubHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `Subir archivo public/${nombreArchivo} desde NEXUS//PLAY`,
      content: fileBuffer.toString("base64"),
      branch: "main",
      ...(sha ? { sha } : {}),
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub no pudo subir el archivo (HTTP ${response.status}).`);
  }

  return response.json();
}
