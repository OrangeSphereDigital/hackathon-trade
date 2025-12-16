import { FounderContactList } from '@/features/admin/founder-contact/list'
import { createFileRoute } from '@tanstack/react-router';
import { authClient } from '@/lib/auth-client';
import { redirect } from '@tanstack/react-router';
import { AdminLayout } from '@/layout/AdminLayout';


export const Route = createFileRoute('/admin/founder-contact')({
    component: Page,
    beforeLoad: async () => {
        const session = await authClient.getSession();
        if (!session.data) {
            redirect({
                to: "/login",
                throw: true,
            });
        }
        if (!session?.data?.user?.role || session.data.user.role !== 'admin') {
            redirect({
                to: "/",
                throw: true,
            });
        }
        return { session };
    },
})

export default function Page() {
    return (
    <AdminLayout>
        <FounderContactList />
    </AdminLayout>
    );
}

