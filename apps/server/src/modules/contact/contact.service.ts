import prisma from "@root/db";
import type { ContactRequest } from "./contact.dto";

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
        
        await this.sendFounderEmail(data);
        
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
        // TODO: Implement email sending logic
        console.log(`[ContactService] Mock sending email to founders from ${data.email}`);
    }
}

export const contactService = new ContactService();
