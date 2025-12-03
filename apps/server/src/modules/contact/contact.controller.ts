import { Elysia } from "elysia";
import { contactService } from "./contact.service";
import { ContactRequestDTO } from "./contact.dto";

export const contactController = new Elysia({ prefix: "/contact" })
    .post(
        "/early-access",
        async ({ body }) => {
            return await contactService.createEarlyAccess(body);
        },
        {
            body: ContactRequestDTO,
            detail: {
                tags: ["Contact"],
                summary: "Submit early access request",
                description: "Collects name, email, phone, and message for early access interest."
            }
        }
    )
    .post(
        "/founders",
        async ({ body }) => {
            return await contactService.createFounderContact(body);
        },
        {
            body: ContactRequestDTO,
            detail: {
                tags: ["Contact"],
                summary: "Contact founders",
                description: "Send a message directly to the founders."
            }
        }
    );
