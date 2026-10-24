import {
  leerArchivoDeGitHub,
  subirArchivoAPublic,
  writeCategoriesFile,
  writeGamesFile,
} from "../repo_api.js";
import { hasAlanSession, isSameOriginRequest } from "../session.js";

const editableFiles = {
  games: "src/app/games.json",
  categories: "src/app/categories.json",
};
const MAX_JSON_SIZE = 1024 * 1024;
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
const allowedImageExtensions = new Set([
  ".avif",
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".webp",
]);

function unauthorizedResponse() {
  return Response.json({ error: "Inicia una sesión privada primero." }, {
    status: 401,
  });
}

function validJsonDocument(file, content) {
  let data;
  try {
    data = JSON.parse(content);
  } catch {
    return false;
  }

  if (file === "games") {
    return (
      data &&
      Array.isArray(data.games) &&
      data.games.every(
        (game) =>
          game &&
          typeof game === "object" &&
          !Array.isArray(game) &&
          ["name", "category", "img", "path"].every(
            (key) => typeof game[key] === "string",
          ) &&
          (game.visibility === undefined ||
            game.visibility === "visible" ||
            game.visibility === "hidden") &&
          (game.alert === undefined || typeof game.alert === "string"),
      )
    );
  }

  return (
    data &&
    Array.isArray(data.categories) &&
    data.categories.every((category) => typeof category === "string")
  );
}

async function parseJsonRequest(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function GET(request) {
  if (!hasAlanSession(request)) return unauthorizedResponse();

  const file = new URL(request.url).searchParams.get("file");
  const path = editableFiles[file];
  if (!path) {
    return Response.json({ error: "Archivo no permitido." }, { status: 400 });
  }

  try {
    const content = await leerArchivoDeGitHub(path);
    return Response.json({ file, content });
  } catch (error) {
    console.error("Failed to read repository file:", error);
    return Response.json({ error: error.message }, { status: 502 });
  }
}

export async function POST(request) {
  if (!isSameOriginRequest(request)) {
    return Response.json({ error: "Origen no permitido." }, { status: 403 });
  }
  if (!hasAlanSession(request)) return unauthorizedResponse();

  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await parseJsonRequest(request);
    if (!body || typeof body !== "object") {
      return Response.json({ error: "Solicitud no válida." }, { status: 400 });
    }
    if (body.action !== "save") {
      return Response.json({ error: "Operación no permitida." }, { status: 400 });
    }

    const { file, content } = body;
    if (
      !editableFiles[file] ||
      typeof content !== "string" ||
      Buffer.byteLength(content, "utf8") > MAX_JSON_SIZE
    ) {
      return Response.json({ error: "Contenido o archivo no válido." }, {
        status: 400,
      });
    }
    if (!validJsonDocument(file, content)) {
      return Response.json({ error: "El JSON no tiene el formato esperado." }, {
        status: 400,
      });
    }

    try {
      const result =
        file === "games"
          ? await writeGamesFile(content)
          : await writeCategoriesFile(content);
      return Response.json({
        saved: true,
        commit: result.commit?.html_url || null,
      });
    } catch (error) {
      console.error("Failed to save repository file:", error);
      return Response.json({ error: error.message }, { status: 502 });
    }
  }

  if (contentType.includes("multipart/form-data")) {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_UPLOAD_SIZE + 64 * 1024) {
      return Response.json({ error: "El archivo supera el límite de 5 MB." }, {
        status: 413,
      });
    }

    let formData;
    try {
      formData = await request.formData();
    } catch {
      return Response.json({ error: "Formulario no válido." }, { status: 400 });
    }

    const file = formData.get("file");
    if (!file || typeof file === "string" || typeof file.arrayBuffer !== "function") {
      return Response.json({ error: "Selecciona un archivo." }, { status: 400 });
    }
    if (file.size === 0 || file.size > MAX_UPLOAD_SIZE) {
      return Response.json({ error: "El archivo debe pesar entre 1 byte y 5 MB." }, {
        status: 400,
      });
    }

    const extension = file.name.match(/\.[^.]+$/)?.[0]?.toLowerCase();
    if (!extension || !allowedImageExtensions.has(extension)) {
      return Response.json(
        { error: "Solo se permiten imágenes AVIF, GIF, JPEG, PNG o WebP." },
        { status: 400 },
      );
    }

    try {
      const result = await subirArchivoAPublic(
        Buffer.from(await file.arrayBuffer()),
        file.name,
      );
      return Response.json({
        uploaded: true,
        path: `public/${file.name}`,
        commit: result.commit?.html_url || null,
      });
    } catch (error) {
      console.error("Failed to upload repository asset:", error);
      return Response.json({ error: error.message }, { status: 502 });
    }
  }

  return Response.json({ error: "Tipo de contenido no compatible." }, {
    status: 415,
  });
}
