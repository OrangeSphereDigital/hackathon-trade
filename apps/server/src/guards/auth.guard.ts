import { Elysia } from "elysia";
import { auth } from "@root/auth";

/**
 * Elysia plugin that enforces authentication.
 * - Retrieves session via Better Auth using request headers.
 * - Returns 401 if unauthenticated.
 * - Derives `session` and `user` for downstream handlers.
 */
export const authGuard = () => (app: Elysia) =>
  app.derive(async (context: any) => {
    const session = await auth.api.getSession({ headers: context.request.headers });
    
    if (!session) {
      return context.error(401, { message: "Unauthorized", status: 401 });
    }

    return {
      session,
      user: session.user,
    };
  });
