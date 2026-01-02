import { Elysia } from "elysia";
import { usersService } from "./users.service";
import { UserQueryDTO, UpdateUserRoleDTO } from "./users.dto";
import { authGuard } from "@/guards/auth.guard";
import { rolesGuard } from "@/guards/role.guard";

export const usersController = new Elysia({ prefix: "/users" })
    .use(authGuard())
    .guard({
        beforeHandle: rolesGuard(["admin"])
    })
    .get("/", async ({ query }) => {
        return await usersService.getUsers(query);
    }, {
        query: UserQueryDTO
    })
    .patch("/role", async ({ body }) => {
        return await usersService.updateUserRole(body);
    }, {
        body: UpdateUserRoleDTO
    });
