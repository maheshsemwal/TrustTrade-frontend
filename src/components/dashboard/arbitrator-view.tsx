import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Scale, Award, TrendingUp, CheckSquare, Clock, Eye, ArrowRight, Info } from 'lucide-react';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress'; // Import Progress component

// Mock data - replace with actual data fetching
const mockVotingOpportunities = [
  { id: 'D-003', caseTitle: 'Dispute: Gadget Inc. vs Client Co.', timeLeft: '2 days', status: 'Voting Open' },
  { id: 'D-004', caseTitle: 'Dispute: Supplies Ltd. vs Customer Co.', timeLeft: '1 day', status: 'Voting Open' },
  { id: 'D-006', caseTitle: 'Dispute: Service Pro vs Buyer LLC', timeLeft: 'Closed', status: 'Voting Closed' },
];

const mockRewardsEarned = 1250; // Example total rewards
const mockAccuracyRate = 92; // Example accuracy rate %
const mockCasesVoted = 45; // Example cases voted on

export function ArbitratorView() {
    const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | null | undefined => {
        if (status === 'Voting Open') return 'default'; // Teal
        if (status === 'Voting Closed') return 'outline'; // Outline
        return 'secondary';
    };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Column 1: Stats & Performance */}
      <div className="md:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Total Rewards Earned</span>
              <Award className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{mockRewardsEarned} TRT</p>
            <Button variant="secondary" size="sm" className="mt-2 w-full">
                Claim Rewards
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
                <span>Performance Stats</span>
                 <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
            <CardDescription>Your arbitration activity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
             <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Voting Accuracy</span>
                    <span className="text-sm font-bold text-primary">{mockAccuracyRate}%</span>
                </div>
                 <Progress value={mockAccuracyRate} aria-label={`${mockAccuracyRate}% Voting Accuracy`} />
            </div>
             <div>
                <p className="text-sm font-medium">Cases Voted On</p>
                <p className="text-xl font-bold">{mockCasesVoted}</p>
            </div>
             <Button variant="link" className="p-0 h-auto text-primary">View Performance Details</Button>
          </CardContent>
        </Card>
          <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
             <Link href="/arbitration/cases">
                <Button className="w-full justify-start group">
                    <Scale className="mr-2 h-4 w-4" /> View Available Cases
                    <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"/>
                </Button>
            </Link>
             <Link href="/leaderboard">
                <Button variant="outline" className="w-full justify-start group">
                    <TrendingUp className="mr-2 h-4 w-4" /> View Leaderboard
                    <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"/>
                </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Column 2: Voting Opportunities */}
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Voting Opportunities</CardTitle>
            <CardDescription>Cases currently open for arbitrator voting.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case ID</TableHead>
                  <TableHead>Case Title</TableHead>
                  <TableHead>Time Left</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockVotingOpportunities.map((dispute) => (
                  <TableRow key={dispute.id}>
                    <TableCell className="font-medium">{dispute.id}</TableCell>
                    <TableCell>{dispute.caseTitle}</TableCell>
                    <TableCell>
                        {dispute.status === 'Voting Open' ? (
                            <span className="flex items-center text-sm">
                                <Clock className="mr-1 h-3 w-3 text-yellow-500" /> {dispute.timeLeft}
                            </span>
                        ) : (
                             <span className="text-sm text-muted-foreground">{dispute.timeLeft}</span>
                        )}

                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(dispute.status)}>
                        {dispute.status === 'Voting Open' && <CheckSquare className="mr-1 h-3 w-3"/>}
                        {dispute.status === 'Voting Closed' && <Info className="mr-1 h-3 w-3"/>}
                        {dispute.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/arbitration/vote/${dispute.id}`}>
                        <Button variant="ghost" size="icon" disabled={dispute.status !== 'Voting Open'}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View & Vote</span>
                        </Button>
                      </Link>
                      {/* Conditionally render Vote button */}
                      {dispute.status === 'Voting Open' && (
                        <Link href={`/arbitration/vote/${dispute.id}`}>
                            <Button size="sm" className="ml-2">Vote Now</Button>
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             {mockVotingOpportunities.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No active voting opportunities.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
