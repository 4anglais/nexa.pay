import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Firebase Admin initialization (SERVER ONLY)
const adminApp =
  getApps().length === 0
    ? initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      })
    : getApps()[0];

const adminAuth = getAuth(adminApp);

export const requireFirebaseAuth = createMiddleware({
  type: "function",
}).server(async ({ next }) => {
  const request = getRequest();

  if (!request?.headers) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    throw new Response("Unauthorized", { status: 401 });
  }

  try {
    // ✅ VERIFY TOKEN USING ADMIN SDK
    const decodedToken = await adminAuth.verifyIdToken(token);

    return next({
      context: {
        userId: decodedToken.uid,
        claims: decodedToken,
      },
    });
  } catch (err) {
    throw new Response("Unauthorized", { status: 401 });
  }
});
