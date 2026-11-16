export interface AuthTokensResponse {
  token: string;
  refreshToken: string;
  expiraEnSeg: number;
  usuario: {
    id: string;
    email: string;
  };
}

const FIREBASE_AUTH_BASE = "https://identitytoolkit.googleapis.com/v1";
const FIREBASE_TOKEN_BASE = "https://securetoken.googleapis.com/v1";

function getApiKey(): string {
  const key = process.env.FIREBASE_WEB_API_KEY;
  if (!key) {
    throw new Error("FIREBASE_WEB_API_KEY no está configurada");
  }
  return key;
}

export async function registrarConEmail(email: string, password: string): Promise<AuthTokensResponse> {
  const apiKey = getApiKey();
  const res = await fetch(`${FIREBASE_AUTH_BASE}/accounts:signUp?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      returnSecureToken: true,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data?.error?.message;
    if (errorMsg === "EMAIL_EXISTS") {
      const err = new Error("El correo ya está registrado");
      (err as unknown as { status: number }).status = 409;
      throw err;
    }
    const err = new Error("Error al registrar el usuario");
    (err as unknown as { status: number }).status = 400;
    throw err;
  }

  return {
    token: data.idToken,
    refreshToken: data.refreshToken,
    expiraEnSeg: parseInt(data.expiresIn, 10),
    usuario: {
      id: data.localId,
      email: data.email,
    },
  };
}

export async function loginConEmail(email: string, password: string): Promise<AuthTokensResponse> {
  const apiKey = getApiKey();
  const res = await fetch(`${FIREBASE_AUTH_BASE}/accounts:signInWithPassword?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      returnSecureToken: true,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error("Credenciales inválidas");
    (err as unknown as { status: number }).status = 401;
    throw err;
  }

  return {
    token: data.idToken,
    refreshToken: data.refreshToken,
    expiraEnSeg: parseInt(data.expiresIn, 10),
    usuario: {
      id: data.localId,
      email: data.email,
    },
  };
}

export async function renovarToken(refreshToken: string): Promise<{ token: string; refreshToken: string; expiraEnSeg: number }> {
  const apiKey = getApiKey();
  const res = await fetch(`${FIREBASE_TOKEN_BASE}/token?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }).toString(),
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error("Token de refresco inválido");
    (err as unknown as { status: number }).status = 401;
    throw err;
  }

  return {
    token: data.id_token,
    refreshToken: data.refresh_token,
    expiraEnSeg: parseInt(data.expires_in, 10),
  };
}
