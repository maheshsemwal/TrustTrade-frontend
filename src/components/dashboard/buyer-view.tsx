import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, CircleDollarSign, CheckCircle, Clock, Eye, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Mock data - replace with actual data fetching
const mockDisputes = [
  { id: 'D-001', seller: 'Vendor Corp', status: 'Resolved', decision: 'Favor Buyer', date: '2024-07-15' },
  { id: 'D-003', seller: 'Supplies Ltd.', status: 'In Review', decision: '-', date: '2024-07-20' },
  { id: 'D-005', seller: 'Gadget Inc.', status: 'Pending Evidence', decision: '-', date: '2024-07-25' },
];

const mockTokens = 500; // Example token balance
const mockReputation = 'Trusted Buyer'; // Example reputation badge

export function BuyerView() {
  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | null | undefined => {
    if (status === 'Resolved') return 'default'; // Use primary color (teal in dark)
    if (status === 'In Review') return 'secondary'; // Use greyish color
    if (status === 'Pending Evidence') return 'outline'; // Use outline style
    return 'default';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Column 1: Quick Stats */}
      <div className="md:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Tokens Held</span>
              <CircleDollarSign className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{mockTokens} TRT</p>
            <Button variant="link" className="p-0 h-auto mt-2 text-primary">View History</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reputation</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-lg">{mockReputation}</Badge>
             {/* Add more reputation details if needed */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Link href="/disputes/new">
                <Button className="w-full justify-start group">
                    <FileText className="mr-2 h-4 w-4" /> File New Dispute
                    <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"/>
                </Button>
            </Link>
             {/* Add other relevant actions */}
          </CardContent>
        </Card>
      </div>

      {/* Column 2: Active/Recent Disputes */}
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>My Disputes</CardTitle>
            <CardDescription>Overview of disputes you've filed.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dispute ID</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Decision</TableHead>
                  <TableHead>Date Filed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockDisputes.map((dispute) => (
                  <TableRow key={dispute.id}>
                    <TableCell className="font-medium">{dispute.id}</TableCell>
                    <TableCell>{dispute.seller}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(dispute.status)}>
                         {dispute.status === 'Resolved' && <CheckCircle className="mr-1 h-3 w-3"/>}
                         {dispute.status === 'In Review' && <Clock className="mr-1 h-3 w-3"/>}
                         {dispute.status === 'Pending Evidence' && <FileText className="mr-1 h-3 w-3"/>}
                        {dispute.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{dispute.decision}</TableCell>
                    <TableCell>{dispute.date}</TableCell>
                    <TableCell>
                      <Link href={`/disputes/${dispute.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View Dispute</span>
                        </Button>
                      </Link>
                      {/* Add other actions like 'Add Evidence' if status allows */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             {mockDisputes.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No disputes filed yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
