import prisma from "@root/db";
import type { ContactRequest } from "./contact.dto";
import { sendInformAdminEmail } from "../../lib/email";

export class ContactService {
    async createEarlyAccess(data: ContactRequest) {
        const result = await prisma.earlyAccess.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                message: data.message
            }
        });

        const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL;
        if (adminEmail) {
            await sendInformAdminEmail({
                to: adminEmail,
                subject: "New Early Access Request",
                type: "early-access",
                name: data.name,
                email: data.email,
                phone: data.phone ?? null,
                message: data.message ?? null,
            });
        }

        return result;
    }

    async createFounderContact(data: ContactRequest) {
        const result = await prisma.founderContact.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                message: data.message
            }
        });

        const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL;
        if (adminEmail) {
            await sendInformAdminEmail({
                to: adminEmail,
                subject: "New Founder Contact Submission",
                type: "founder-contact",
                name: data.name,
                email: data.email,
                phone: data.phone ?? null,
                message: data.message ?? null,
            });
        }

        return result;
    }

    async getAllEarlyAccess() {
        return await prisma.earlyAccess.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    async getAllFounderContacts() {
        return await prisma.founderContact.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    private async sendFounderEmail(data: ContactRequest) {
        console.log(`[ContactService] Mock sending email to founders from ${data.email}`);
    }
}

export const contactService = new ContactService();
