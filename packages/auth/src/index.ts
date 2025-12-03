import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@root/db";

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	trustedOrigins: [process.env.CORS_ORIGIN || ""],
	emailAndPassword: {
		enabled: true,
	},
	user: {
		additionalFields: {
			role: {
				type: "string",
				input: false,
			},
		},
	},
	advanced: {
		cookies: {
			session_token: {
				name: "21seconds2mars.session_token"
			}
		},
		defaultCookieAttributes: {
			sameSite: "none",
			secure: true,
			httpOnly: true,
		},
	},
	session: {
		expiresIn: 3600 * 24 * 7,
		updateAge: 3600 * 24 * 7,
	}
});
