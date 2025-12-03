import { t } from "elysia";

export const ContactRequestDTO = t.Object({
    name: t.String(),
    email: t.String({ format: 'email' }),
    phone: t.Optional(t.String()),
    message: t.Optional(t.String())
});

export type ContactRequest = typeof ContactRequestDTO.static;
