"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Scale, Send } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"


interface VotingSectionProps {
    disputeId: string;
    aiSummary: string; // Pass the AI summary here
}

// Assume this component is only rendered for arbitrators and when voting is open

export default function VotingSection({ disputeId, aiSummary }: VotingSectionProps) {
    const [vote, setVote] = useState<'buyer' | 'seller' | null>(null);
    const [comment, setComment] = useState('');
    const [hasVoted, setHasVoted] = useState(false); // Track if the user has voted
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock results (replace with actual results fetching after voting)
    const mockResults = {
        buyerVotes: 65,
        sellerVotes: 35,
        totalVotes: 100,
    };

    const handleSubmitVote = async () => {
        if (!vote) {
            alert("Please select who you support (Buyer or Seller).");
            return;
        }
        setIsSubmitting(true);
        console.log(`Submitting vote for Dispute ${disputeId}: Support ${vote}, Comment: ${comment}`);

        // Simulate API call / Smart contract interaction
        await new Promise(resolve => setTimeout(resolve, 1500));

        // On successful submission:
        setHasVoted(true);
        setIsSubmitting(false);
        // In a real app, you might disable voting or show results immediately
        // based on whether the voting period is over.
    };

    const calculatePercentage = (votes: number, total: number) => {
        if (total === 0) return 0;
        return Math.round((votes / total) * 100);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                     <Scale className="mr-2 h-5 w-5 text-primary" /> Arbitrator Voting Panel
                </CardTitle>
                <CardDescription>Review the case summary and cast your vote.</CardDescription>
            </CardHeader>
            <CardContent>
                 {/* Display AI Summary briefly */}
                 <div className="mb-6 p-4 border rounded-md bg-muted/30 max-h-40 overflow-y-auto">
                    <h4 className="font-semibold mb-2 text-sm">AI Case Summary Snapshot:</h4>
                    <p className="text-sm text-muted-foreground italic line-clamp-4">
                        {aiSummary || "Summary loading or not available..."}
                    </p>
                     <Link href="#ai-summary-section"> {/* Link to full summary section if needed */}
                        <Button variant="link" size="sm" className="p-0 h-auto mt-1">View Full Summary</Button>
                    </Link>
                 </div>

                {!hasVoted ? (
                    <div className="space-y-4">
                        <Label className="text-base font-semibold">Cast Your Vote:</Label>
                        <div className="flex gap-4">
                            <Button
                                variant={vote === 'buyer' ? 'default' : 'outline'}
                                onClick={() => setVote('buyer')}
                                className={`flex-1 ${vote === 'buyer' ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                                disabled={isSubmitting}
                            >
                                <ThumbsUp className="mr-2 h-4 w-4" /> Support Buyer
                            </Button>
                            <Button
                                variant={vote === 'seller' ? 'default' : 'outline'}
                                onClick={() => setVote('seller')}
                                className={`flex-1 ${vote === 'seller' ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                                disabled={isSubmitting}
                            >
                                <ThumbsDown className="mr-2 h-4 w-4" /> Support Seller
                            </Button>
                        </div>

                        <div>
                            <Label htmlFor="vote-comment">Justify Your Vote (Optional)</Label>
                            <Textarea
                                id="vote-comment"
                                placeholder="Explain the reasoning behind your decision..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="mt-1 min-h-[80px]"
                                disabled={isSubmitting}
                            />
                        </div>

                        <Button onClick={handleSubmitVote} className="w-full" disabled={!vote || isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            {isSubmitting ? 'Submitting Vote...' : 'Submit Vote (Sign Transaction)'}
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">Submitting your vote will require signing a transaction with your connected wallet.</p>
                    </div>
                ) : (
                    // Show results after voting (or maybe only after voting period ends)
                    <Alert>
                         <CheckCircle className="h-4 w-4"/>
                        <AlertTitle>Vote Submitted!</AlertTitle>
                        <AlertDescription>
                            Thank you for participating. Your vote has been recorded on the blockchain.
                            <div className="mt-4 space-y-2">
                                <h4 className="font-semibold">Current Results (Example):</h4>
                                <div className="flex items-center justify-between">
                                    <span>Support Buyer:</span>
                                     <span className="font-bold">{calculatePercentage(mockResults.buyerVotes, mockResults.totalVotes)}%</span>
                                </div>
                                 <div className="w-full bg-muted rounded-full h-2.5">
                                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${calculatePercentage(mockResults.buyerVotes, mockResults.totalVotes)}%` }}></div>
                                </div>
                                 <div className="flex items-center justify-between mt-1">
                                    <span>Support Seller:</span>
                                     <span className="font-bold">{calculatePercentage(mockResults.sellerVotes, mockResults.totalVotes)}%</span>
                                </div>
                                 <div className="w-full bg-muted rounded-full h-2.5">
                                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${calculatePercentage(mockResults.sellerVotes, mockResults.totalVotes)}%` }}></div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">Total Votes: {mockResults.totalVotes}</p>
                                <p className="text-xs text-muted-foreground">Your Vote: Support {vote}</p>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}

// Need imports
import Link from 'next/link';
import { Loader2, CheckCircle } from 'lucide-react';
