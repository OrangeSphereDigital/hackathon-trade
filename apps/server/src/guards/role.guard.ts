import { auth } from "@root/auth";
// import type { Role } from "prisma/generated/enums"; // TODO: Ensure Role is defined in Prisma Schema

export type Role = "admin" | "user"; // Placeholder until Prisma schema is updated

/**
 * Elysia beforeHandle guard to allow access only for specified roles.
 * - Retrieves session via Better Auth using request headers.
 * - Returns 401 if unauthenticated.
 * - Returns 403 if role is not allowed. Admin always passes.
 */
export const rolesGuard = (allowed: Role[]) =>
  async (ctx: any) => {
    // Prefer derived values from sessionCache middleware
    const derivedUser = ctx.user as { role?: Role } | undefined;
    if (derivedUser?.role) {
      const role = derivedUser.role as Role;
      if (role === "admin") return; // admin bypass
      if (!allowed.includes(role))
        return ctx.error(403, { message: "Forbidden", status: 403 });
      return;
    }

    const session = await auth.api.getSession({ headers: ctx.request.headers });
    if (!session)
      return ctx.error(401, { message: "Unauthorized", status: 401 });

    const role = (session.user as any).role as Role | undefined; // Type cast as session.user might not have role typed yet
    if (!role)
      return ctx.error(401, { message: "Unauthorized", status: 401 });

    if (role === "admin") return; // admin bypass
    if (!allowed.includes(role))
      return ctx.error(403, { message: "Forbidden", status: 403 });

    // proceed
    return; 
  };
