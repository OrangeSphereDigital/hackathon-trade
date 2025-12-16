import { Elysia } from "elysia";
import { contactService } from "./contact.service";
import { ContactRequestDTO } from "./contact.dto";

import { rolesGuard } from "../../guards/role.guard";

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
    )
    .guard({
        beforeHandle: rolesGuard(["admin"])
    }, (app) => app
        .get(
            "/early-access",
            async () => {
                return await contactService.getAllEarlyAccess();
            },
            {
                detail: {
                    tags: ["Contact", "Admin"],
                    summary: "Get all early access requests",
                    description: "Retrieve all early access submissions. Admin only."
                }
            }
        )
        .get(
            "/founders",
            async () => {
                return await contactService.getAllFounderContacts();
            },
            {
                detail: {
                    tags: ["Contact", "Admin"],
                    summary: "Get all founder contacts",
                    description: "Retrieve all founder contact messages. Admin only."
                }
            }
        )
    );
