import { Elysia } from "elysia";
import { adminService } from "./admin.service";
import { AdminGetDataDTO, AdminGetByIdDTO } from "./admin.dto";
import { authGuard } from "@/guards/auth.guard";
import { rolesGuard } from "@/guards/role.guard";

export const adminController = new Elysia({ prefix: "/admin" })
    .use(authGuard())
    .guard({
        beforeHandle: rolesGuard(["admin"]) 
    })
    .get("/bnb-data", async ({ query }) => {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        return await adminService.getBnbData(page, limit);
    }, {
        query: AdminGetDataDTO
    })
    .get("/bnb-data/:id", async ({ params }) => {
        const data = await adminService.getBnbDataById(params.id);
        if (!data) throw new Error("Data not found");
        return data;
    }, {
        params: AdminGetByIdDTO
    });
