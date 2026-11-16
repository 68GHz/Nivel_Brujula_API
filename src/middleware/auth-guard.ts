import { NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  rol?: string;
}

export async function verifyAuth(req: NextRequest): Promise<AuthenticatedUser | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return null;
  }

  try {
    const decoded = await adminAuth().verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: decoded.email,
      rol: (decoded.rol as string) || "user",
    };
  } catch {
    return null;
  }
}
