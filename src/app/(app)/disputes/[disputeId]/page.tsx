// src/app/(app)/disputes/[disputeId]/page.tsx
"use client";

import { useParams } from 'next/navigation';
import DisputeTimeline from '@/components/disputes/dispute-timeline';
import AiCaseSummary from '@/components/disputes/ai-case-summary';
import DisputeDetails from '@/components/disputes/dispute-details'; // Assume this component exists
import EvidenceViewer from '@/components/disputes/evidence-viewer'; // Assume this component exists
import ChatSection from '@/components/disputes/chat-section'; // Assume this component exists
import VotingSection from '@/components/disputes/voting-section'; // Assume this component exists for arbitrators
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { generateDisputeSummary } from '@/ai/flows/generate-dispute-summary'; // Import the Genkit flow
import type { GenerateDisputeSummaryInput } from '@/ai/flows/generate-dispute-summary'; // Import the input type

// Mock Data - Replace with actual data fetching logic based on disputeId
const mockDispute = {
  id: 'D-003',
  title: 'Dispute: Gadget Inc. vs Client Co. - Defective Product Claim',
  status: 'In Review', // Example status
  buyer: 'Client Co.',
  seller: 'Gadget Inc.',
  buyerDescription: 'The received gadget stopped working after one week. We request a full refund.',
  sellerDescription: 'The product was tested before shipping and worked perfectly. Damage likely occurred due to misuse.',
  filedDate: '2024-07-20T10:00:00Z',
  evidence: [
    { type: 'image', content: 'https://picsum.photos/seed/gadget1/300/200', description: 'Photo of the non-working gadget' },
    { type: 'pdf', content: 'data:application/pdf;base64,...', description: 'Invoice PDF' }, // Use actual data URI in real app
    { type: 'text', content: 'User manual explicitly states not to expose to water.', description: 'Excerpt from User Manual' }
  ],
  timelineEvents: [
    { stage: 'Filed', timestamp: '2024-07-20T10:00:00Z', txHash: '0xabc...' },
    { stage: 'Evidence', timestamp: '2024-07-22T14:30:00Z', txHash: '0xdef...' },
    { stage: 'Summary', timestamp: null, txHash: null }, // Summary not generated yet
    { stage: 'Voting', timestamp: null, txHash: null },
    { stage: 'Resolved', timestamp: null, txHash: null },
  ],
};

// Assume a way to determine the user's role (e.g., from context or auth)
const userRole: 'buyer' | 'seller' | 'arbitrator' = 'arbitrator'; // Example role

export default function DisputeDetailPage() {
  const params = useParams();
  const disputeId = params.disputeId as string;
  const [disputeData, setDisputeData] = useState<typeof mockDispute | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch dispute data based on disputeId
    const fetchData = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, fetch data for the specific disputeId
      if (disputeId === mockDispute.id) {
        setDisputeData(mockDispute);
        // Fetch initial AI summary if needed (or trigger on demand)
        handleGenerateSummary(mockDispute, false); // Fetch summary on load, don't show loading initially unless necessary
      } else {
        // Handle case where dispute is not found
      }
      setIsLoading(false);
    };
    fetchData();
  }, [disputeId]);

  const handleGenerateSummary = async (data: typeof mockDispute | null = disputeData, showLoading: boolean = true) => {
    if (!data) return;
    if (showLoading) setIsSummaryLoading(true);
    setSummaryError(null);

    const input: GenerateDisputeSummaryInput = {
        disputeId: data.id,
        buyerDescription: data.buyerDescription,
        sellerDescription: data.sellerDescription,
        evidence: data.evidence.map(e => ({
            type: e.type as 'text' | 'image' | 'pdf' | 'audio', // Ensure type matches expected enum
            content: e.content,
            description: e.description
        }))
    };

    try {
        const result = await generateDisputeSummary(input);
        setAiSummary(result.summary);
        // Find the 'Summary' event and update its timestamp (mock update)
        setDisputeData(prevData => {
            if (!prevData) return null;
            const now = new Date().toISOString();
            return {
                ...prevData,
                timelineEvents: prevData.timelineEvents.map(event =>
                    event.stage === 'Summary' ? { ...event, timestamp: now, txHash: '0xgen...' } : event
                )
            };
        });
    } catch (error) {
        console.error("Error generating summary:", error);
        setSummaryError("Failed to generate summary. Please try again.");
        setAiSummary(null);
    } finally {
        if (showLoading) setIsSummaryLoading(false);
    }
  };


  if (isLoading || !disputeData) {
    return <DisputeDetailSkeleton />;
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-2">{disputeData.title}</h1>
      <p className="text-muted-foreground mb-6">Dispute ID: {disputeData.id} - Status: <Badge variant={disputeData.status === 'Resolved' ? 'default' : 'secondary'}>{disputeData.status}</Badge></p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area (Left/Top on Mobile) */}
        <div className="lg:col-span-2 space-y-6">
           {/* Dispute Timeline */}
            <DisputeTimeline events={disputeData.timelineEvents} currentStatus={disputeData.status} />

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="evidence">Evidence</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <DisputeDetails dispute={disputeData} />
            </TabsContent>
            <TabsContent value="evidence">
              <EvidenceViewer evidence={disputeData.evidence} />
            </TabsContent>
            <TabsContent value="chat">
               <ChatSection disputeId={disputeData.id} />
            </TabsContent>
          </Tabs>

           {/* Voting Section (for Arbitrators when status is 'In Review' or 'Voting') */}
           {(userRole === 'arbitrator' && (disputeData.status === 'In Review' || disputeData.status === 'Voting Open')) && ( // Adjust status check as needed
                <VotingSection disputeId={disputeData.id} aiSummary={aiSummary || "Summary not available yet."} />
            )}
        </div>

        {/* Sidebar Area (Right/Bottom on Mobile) */}
        <div className="lg:col-span-1 space-y-6">
             {/* AI Case Summary */}
            <AiCaseSummary
                summary={aiSummary}
                isLoading={isSummaryLoading}
                error={summaryError}
                onRegenerate={() => handleGenerateSummary()}
                // Add onRate and onFlag props later
             />
             {/* Add other potential sidebar elements like related disputes, actions etc. */}
        </div>
      </div>
    </div>
  );
}


// Skeleton Loader Component
const DisputeDetailSkeleton = () => (
  <div className="container mx-auto py-8 px-4 md:px-6">
    <Skeleton className="h-8 w-3/4 mb-2" />
    <Skeleton className="h-5 w-1/2 mb-6" />

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {/* Timeline Skeleton */}
        <Card>
           <CardHeader>
             <Skeleton className="h-6 w-1/4" />
           </CardHeader>
           <CardContent className="flex justify-between p-6">
                <Skeleton className="h-10 w-16" />
                <Skeleton className="h-10 w-16" />
                <Skeleton className="h-10 w-16" />
                <Skeleton className="h-10 w-16" />
                <Skeleton className="h-10 w-16" />
           </CardContent>
        </Card>

        {/* Tabs Skeleton */}
         <Skeleton className="h-10 w-full mb-4" />
         <Card>
            <CardContent className="pt-6">
                <Skeleton className="h-6 w-1/3 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
                 <Skeleton className="h-6 w-1/3 mt-6 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
            </CardContent>
         </Card>
      </div>
      <div className="lg:col-span-1 space-y-6">
         {/* AI Summary Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-1/3 mt-1" />
          </CardHeader>
          <CardContent className="space-y-3">
             <Skeleton className="h-4 w-full" />
             <Skeleton className="h-4 w-full" />
             <Skeleton className="h-4 w-full" />
             <Skeleton className="h-4 w-4/5" />
             <Skeleton className="h-8 w-full mt-4" />
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);
