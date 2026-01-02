import { t } from "elysia";

export const UserQueryDTO = t.Object({
    page: t.Optional(t.Numeric()),
    limit: t.Optional(t.Numeric()),
    search: t.Optional(t.String())
});

export const UpdateUserRoleDTO = t.Object({
    userId: t.String(),
    role: t.Union([t.Literal("admin"), t.Literal("user")])
});

export type UserQuery = typeof UserQueryDTO.static;
export type UpdateUserRole = typeof UpdateUserRoleDTO.static;
