import { createFileRoute, redirect } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'

import { Card, CardContent } from '@/components/ui/card'
import { AdminLayout } from '@/layout/AdminLayout'

export const Route = createFileRoute('/admin/dashboard')({
    component: Dashboard,
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


function Dashboard() {

    return (
        <>
            <AdminLayout >
                <Card>
                    <CardContent>
                        <h2 className="text-lg font-semibold">Dashboard Content</h2>
                        <p>Select a menu item to view content</p>
                    </CardContent>
                </Card>
            </AdminLayout>
        </>
    )
}

