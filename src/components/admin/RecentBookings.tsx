import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

const RecentBookings = () => {
  // Mock data - replace with real data from your API
  const recentBookings = [
    {
      id: "BK1001",
      guest: "John Doe",
      room: "Deluxe Room",
      checkIn: "2024-09-10",
      checkOut: "2024-09-15",
      amount: "₦325,000",
      status: "confirmed"
    },
    {
      id: "BK1002",
      guest: "Jane Smith",
      room: "Executive Suite",
      checkIn: "2024-09-11",
      checkOut: "2024-09-13",
      amount: "₦420,000",
      status: "pending"
    },
    {
      id: "BK1003",
      guest: "Michael Johnson",
      room: "Presidential Suite",
      checkIn: "2024-09-12",
      checkOut: "2024-09-14",
      amount: "₦750,000",
      status: "confirmed"
    },
    {
      id: "BK1004",
      guest: "Sarah Williams",
      room: "Standard Room",
      checkIn: "2024-09-10",
      checkOut: "2024-09-12",
      amount: "₦180,000",
      status: "cancelled"
    },
    {
      id: "BK1005",
      guest: "David Brown",
      room: "Deluxe Room",
      checkIn: "2024-09-11",
      checkOut: "2024-09-16",
      amount: "₦540,000",
      status: "completed"
    }
  ];

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'completed':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Bookings</CardTitle>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentBookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.id}</TableCell>
                <TableCell>{booking.guest}</TableCell>
                <TableCell>{booking.room}</TableCell>
                <TableCell>{booking.checkIn}</TableCell>
                <TableCell>{booking.checkOut}</TableCell>
                <TableCell>{booking.amount}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(booking.status)}>
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RecentBookings;
