import { client } from "@/lib/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function UserList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ["users", { page, search }],
    queryFn: async () => {
      const response = await client.users.get({
        query: {
          page,
          limit,
          search: search || undefined,
        },
      });
      if (response.error) throw response.error;
      return response.data;
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: "admin" | "user";
    }) => {
      const response = await client.users.role.patch({
        userId,
        role,
      });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  if (isLoading && page === 1 && !search) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading users</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>User Management</CardTitle>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.users.map((user: any) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {user.image && (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    {user.name}
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    }`}
                  >
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Select
                    value={user.role}
                    onValueChange={(value: "admin" | "user") =>
                      updateRoleMutation.mutate({
                        userId: user.id,
                        role: value,
                      })
                    }
                    disabled={updateRoleMutation.isPending}
                  >
                    <SelectTrigger className="w-32 ml-auto">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
            {data?.users.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-muted-foreground"
                >
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="text-sm font-medium">
              Page {page} of {data.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
