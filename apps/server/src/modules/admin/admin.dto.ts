import { t } from "elysia";

export const AdminGetDataDTO = t.Object({
    // Add query params if needed, e.g. page, limit
    page: t.Optional(t.Numeric()),
    limit: t.Optional(t.Numeric())
});

export const AdminGetByIdDTO = t.Object({
    id: t.String()
});
