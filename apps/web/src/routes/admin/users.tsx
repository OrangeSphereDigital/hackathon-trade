import { UserList } from "@/features/admin/users/list";
import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { redirect } from "@tanstack/react-router";
import { AdminLayout } from "@/layout/AdminLayout";

export const Route = createFileRoute("/admin/users")({
  component: Page,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({
        to: "/login",
      });
    }
    if (!session?.data?.user?.role || session.data.user.role !== "admin") {
      throw redirect({
        to: "/",
      });
    }
    return { session };
  },
});

export default function Page() {
  return (
    <AdminLayout>
      <UserList />
    </AdminLayout>
  );
}
