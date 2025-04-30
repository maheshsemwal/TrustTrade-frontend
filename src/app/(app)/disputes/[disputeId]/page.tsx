// src/app/(app)/disputes/[disputeId]/page.tsx
"use client";

import { useParams, useRouter } from 'next/navigation'; // Import useRouter
import DisputeTimeline from '@/components/disputes/dispute-timeline';
import AiCaseSummary from '@/components/disputes/ai-case-summary';
import DisputeDetails from '@/components/disputes/dispute-details';
import EvidenceViewer from '@/components/disputes/evidence-viewer';
import ChatSection from '@/components/disputes/chat-section';
import VotingSection from '@/components/disputes/voting-section';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge'; // Import Badge
import { Button } from '@/components/ui/button'; // Import Button
import { useEffect, useState } from 'react';
import { generateDisputeSummary } from '@/ai/flows/generate-dispute-summary'; // Import the Genkit flow
import type { GenerateDisputeSummaryInput } from '@/ai/flows/generate-dispute-summary'; // Import the input type
import { AlertCircle } from 'lucide-react'; // Import AlertCircle for not found message
import Link from 'next/link';

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
    { type: 'pdf', content: 'data:application/pdf;base64,JVBERi0xLjQKMyAwIG9iago8PC9UeXBlIC9QYWdlCi9QYXJlbnQgMSAwIFIKL1Jlc291cmNlcyAyIDAgUgovQ29udGVudHMgNCAwIFI+PgplbmRvYmoKNCAwIG9iago8PC9GaWx0ZXIgL0ZsYXRlRGVjb2RlIC9MZW5ndGggODc+PgpzdHJlYW0KeJyNWMEKwjAM/Zf+DhZBL6ULM66+gIXXQYJ6E6WpSVqEdH/fZOc7B6cE5DAgjDAe0y20wKj8t5VjTmjY4lM7M1M4HSO/zTqjKIpn8LgXo7U1Q91f2b+e3+e97fF5Dxf5C7o5aT6jI103kM5+o8U0QJ8aY0kCmD65Ea86nd8/8+b6q5v7/h5A2jK04u/wHwN7xS8KZW5kc3RyZWFtCmVuZG9iagoxIDAgb2JqCjw8L1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUiBdCi9Db3VudCAxCi9NZWRpYUJveCBbMCAwIDMwMCAxNDRdPj4KZW5kb2JqCjUgMCBvYmoKPDwvVHlwZSAvRm9udAovU3VidHlwZSAvVHlwZTEKL0Jhc2VGb250IC9UaW1lcy1Sb21hbgovRW5jb2RpbmcgL1dpbkFuc2lFbmNvZGluZz4+CmVuZG9iagoyIDAgb2JqCjw8L1Byb2NTZXQgWyAvUERGIC9UZXh0IC9JbWFnZUIgL0ltYWdlQyAvSW1hZ2VJIF0KL0ZvbnQgPDwgL0YxIDUgMCBSID4+Ci9YT2JqZWN0IDw8ID4+Pj4KZW5kb2JqCjYgMCBvYmoKPDwvUHJvZHVjZXIgKFB5RlBERiAyLjEuMSkKL0NyZWF0aW9uRGF0ZSAoRDoyMDI0MDgyMjE1MDAwMFopPj4KZW5kb2JqCjcgMCBvYmoKPDwvVHlwZSAvQ2F0YWxvZwovUGFnZXMgMSAwIFI+PgplbmRvYmoKeHJlZgowIDggCjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDIzMiA2NTUzNSBmIAowMDAwMDAwMzgxIDAwMDAwIG4gCjAwMDAwMDAwMDkgNjU1MzUgZiAKMDAwMDAwMDA4MCAwMDAwMCBuIAowMDAwMDAwMjgzIDAwMDAwIG4gCjAwMDAwMDA0NjQgMDAwMDAgbiAKMDAwMDAwMDU1MiAwMDAwMCBuIAp0cmFpbGVyCjw8L1NpemUgOCAvUm9vdCA3IDAgUgovSW5mbyA2IDAgUgovSUQgWzw3MTM5NDUzNzMzNzIzNTM1M0Y0OTQ5NDQzNDMzNDI0Mj48NzEzOTQ1MzczMzczMzUzNTNGNDk0OTQ0MzQzMzQyNDI+XQo+PgpzdGFydHhyZWYKNjE5CiUlRU9GCg==', description: 'Invoice PDF' }, // Simple base64 PDF
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
  const router = useRouter(); // Get router instance
  const disputeId = params.disputeId as string;
  const [disputeData, setDisputeData] = useState<typeof mockDispute | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false); // State to track if dispute wasn't found

  useEffect(() => {
    // Fetch dispute data based on disputeId
    const fetchData = async () => {
      setIsLoading(true);
      setNotFound(false); // Reset not found state on new fetch
      setDisputeData(null); // Reset dispute data
      setAiSummary(null); // Reset AI summary
      setSummaryError(null); // Reset summary error

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real app, fetch data for the specific disputeId
      if (disputeId === mockDispute.id) {
        setDisputeData(mockDispute);
        // Fetch initial AI summary if needed (or trigger on demand)
        handleGenerateSummary(mockDispute, false); // Fetch summary on load
      } else {
        // Handle case where dispute is not found
        setNotFound(true);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [disputeId]); // Re-run effect when disputeId changes

  const handleGenerateSummary = async (data: typeof mockDispute | null = disputeData, showLoading: boolean = true) => {
    if (!data) return;
    if (showLoading) setIsSummaryLoading(true);
    setSummaryError(null);

    // Ensure evidence content is valid before sending (especially data URIs)
    const preparedEvidence = data.evidence.map(e => ({
      type: e.type as 'text' | 'image' | 'pdf' | 'audio',
      content: e.content || '', // Ensure content is not undefined/null
      description: e.description
    })).filter(e => e.content); // Filter out items with empty content just in case

    const input: GenerateDisputeSummaryInput = {
        disputeId: data.id,
        buyerDescription: data.buyerDescription,
        sellerDescription: data.sellerDescription,
        evidence: preparedEvidence,
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
        let errorMessage = "Failed to generate summary. Please try again.";
        if (error instanceof Error) {
            errorMessage += ` Details: ${error.message}`;
        }
        setSummaryError(errorMessage);
        setAiSummary(null);
    } finally {
        if (showLoading) setIsSummaryLoading(false);
    }
  };

  // --- Render Logic ---

  if (isLoading) {
    return <DisputeDetailSkeleton />;
  }

  if (notFound) {
    return (
       <div className="py-20 flex flex-col items-center justify-center text-center">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold mb-2">Dispute Not Found</h1>
        <p className="text-muted-foreground mb-6">The dispute with ID <span className="font-mono bg-muted px-1 rounded">{disputeId}</span> could not be found.</p>
        <Link href="/dashboard">
          <Button variant="outline">Go to Dashboard</Button>
        </Link>
      </div>
    );
  }

  // If loading is done and disputeData exists
  if (disputeData) {
      const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | null | undefined => {
        if (status === 'Resolved') return 'default';
        if (status === 'In Review' || status === 'Voting Open') return 'secondary';
        if (status === 'Pending Evidence') return 'outline';
        return 'default';
      };

      return (
        <div className="py-8">
          <h1 className="text-3xl font-bold mb-2">{disputeData.title}</h1>
          <p className="text-muted-foreground mb-6">
            Dispute ID: {disputeData.id} - Status: <Badge variant={getStatusBadgeVariant(disputeData.status)}>{disputeData.status}</Badge>
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area (Left/Top on Mobile) */}
            <div className="lg:col-span-2 space-y-6">
               {/* Dispute Timeline */}
               {/* @ts-ignore */}
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
                  {/* @ts-ignore */}
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
                 />
                 {/* Add other potential sidebar elements like related disputes, actions etc. */}
            </div>
          </div>
        </div>
      );
  }

   // Fallback if loading is finished but no data and not explicitly 'not found' (should ideally not happen)
   return (
     <div className="py-20 text-center">
        <p className="text-muted-foreground">Could not load dispute details.</p>
      </div>
   );
}


// Skeleton Loader Component
const DisputeDetailSkeleton = () => (
  <div className="py-8">
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
