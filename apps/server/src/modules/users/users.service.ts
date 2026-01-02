import prisma from "@root/db";
import type { UpdateUserRole, UserQuery } from "./users.dto";

export class UsersService {
    async getUsers(query: UserQuery) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const search = query.search;

        const where = search ? {
            OR: [
                { email: { contains: search, mode: 'insensitive' as const } },
                { name: { contains: search, mode: 'insensitive' as const } }
            ]
        } : {};

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.user.count({ where })
        ]);

        return {
            users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async updateUserRole(data: UpdateUserRole) {
        const user = await prisma.user.update({
            where: { id: data.userId },
            data: { role: data.role }
        });
        return user;
    }
}

export const usersService = new UsersService();
