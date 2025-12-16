import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function FounderContactList() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["founder-contact"],
        queryFn: async () => {
            const response = await client.contact.founders.get();
            if (response.error) throw response.error;
            return response.data;
        },
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500">Error loading data</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Founder Contact Messages</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.map((item: any) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.email}</TableCell>
                                <TableCell>{item.phone || "-"}</TableCell>
                                <TableCell className="max-w-xs truncate" title={item.message || ""}>
                                    {item.message || "-"}
                                </TableCell>
                                <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                        {data?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">
                                    No records found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
