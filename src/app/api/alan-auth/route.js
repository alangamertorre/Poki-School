import { timingSafeEqual } from "node:crypto";
import {
  createAlanSessionToken,
  expiredSessionCookie,
  isSameOriginRequest,
  sessionCookie,
} from "../session.js";

export async function POST(request) {
  if (!isSameOriginRequest(request)) {
    return Response.json({ error: "Origen no permitido." }, { status: 403 });
  }

  const expectedPassword = process.env.ALAN_PASSWORD;
  if (!expectedPassword) {
    console.error("ALAN_PASSWORD is not configured on the server.");
    return Response.json(
      { error: "La autenticación no está configurada en el servidor." },
      { status: 500 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Solicitud no válida." }, { status: 400 });
  }

  const password = body?.password;
  if (typeof password !== "string") {
    return Response.json({ error: "Solicitud no válida." }, { status: 400 });
  }

  const providedBuffer = Buffer.from(password);
  const expectedBuffer = Buffer.from(expectedPassword);
  const matches =
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer);

  if (!matches) {
    return Response.json({ authorized: false }, { status: 401 });
  }

  const sessionToken = createAlanSessionToken();
  if (!sessionToken) {
    return Response.json(
      { error: "No se pudo iniciar la sesión." },
      { status: 500 },
    );
  }

  return Response.json(
    { authorized: true },
    { headers: { "Set-Cookie": sessionCookie(sessionToken, request) } },
  );
}

export async function DELETE(request) {
  if (!isSameOriginRequest(request)) {
    return Response.json({ error: "Origen no permitido." }, { status: 403 });
  }

  return Response.json(
    { authorized: false },
    { headers: { "Set-Cookie": expiredSessionCookie(request) } },
  );
}
