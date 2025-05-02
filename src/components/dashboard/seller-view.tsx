import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShieldCheck, Star, MessageSquare, CheckCircle, Clock, Eye, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Mock data - replace with actual data fetching
const mockOpenCases = [
  { id: 'D-002', buyer: 'Client Inc.', status: 'In Review', date: '2024-07-18' },
  { id: 'D-004', buyer: 'Customer Co.', status: 'Pending Evidence', date: '2024-07-22' },
];

const mockReputationScore = 4.8; // Example reputation score
const mockReputationBadge = 'Trusted Vendor'; // Example reputation badge
const mockFeedbackCount = 25; // Example feedback count

export function SellerView() {
    const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | null | undefined => {
        if (status === 'Resolved') return 'default';
        if (status === 'In Review') return 'secondary';
        if (status === 'Pending Evidence') return 'outline';
        return 'default';
    };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Column 1: Quick Stats & Actions */}
      <div className="md:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Reputation Status</span>
              <ShieldCheck className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-2">
              <Star className="h-6 w-6 text-yellow-400 mr-1" />
              <p className="text-3xl font-bold">{mockReputationScore.toFixed(1)} / 5.0</p>
            </div>
            <Badge variant="secondary" className="text-md mb-2">{mockReputationBadge}</Badge>
            <p className="text-sm text-muted-foreground">{mockFeedbackCount} Reviews</p>
            <Button variant="link" className="p-0 h-auto mt-2 text-primary">View Feedback</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
             <Link href="/feedback">
                <Button className="w-full justify-start group">
                    <MessageSquare className="mr-2 h-4 w-4" /> View Feedback / Respond
                    <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"/>
                </Button>
            </Link>
            {/* Add other seller-specific actions */}
          </CardContent>
        </Card>
      </div>

      {/* Column 2: Open Cases */}
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Open Cases Against You</CardTitle>
            <CardDescription>Disputes filed by buyers that require your attention.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case ID</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Filed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockOpenCases.map((dispute) => (
                  <TableRow key={dispute.id}>
                    <TableCell className="font-medium">{dispute.id}</TableCell>
                    <TableCell>{dispute.buyer}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(dispute.status)}>
                         {dispute.status === 'Resolved' && <CheckCircle className="mr-1 h-3 w-3"/>}
                         {dispute.status === 'In Review' && <Clock className="mr-1 h-3 w-3"/>}
                         {dispute.status === 'Pending Evidence' && <FileText className="mr-1 h-3 w-3"/>}
                        {dispute.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{dispute.date}</TableCell>
                    <TableCell>
                      <Link href={`/disputes/${dispute.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View Case</span>
                        </Button>
                      </Link>
                       {/* Add 'Submit Evidence' or 'Respond' button based on status */}
                       {dispute.status === 'Pending Evidence' && (
                         <Button variant="outline" size="sm" className="ml-2">Submit Evidence</Button>
                       )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             {mockOpenCases.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No open cases against you.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Need to import FileText
import { FileText } from 'lucide-react';
