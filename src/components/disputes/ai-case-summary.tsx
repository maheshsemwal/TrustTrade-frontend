"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, RefreshCw, ThumbsUp, ThumbsDown, Flag, Volume2, Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Textarea } from "@/components/ui/textarea"; // For rating comments
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AiCaseSummaryProps {
  summary: string | null;
  isLoading: boolean;
  error: string | null;
  onRegenerate: () => void;
  // Add function props for rating and flagging later
  // onRate: (rating: 'good' | 'bad', comment?: string) => void;
  // onFlag: (reason: string) => void;
}

export default function AiCaseSummary({
  summary,
  isLoading,
  error,
  onRegenerate,
  // onRate,
  // onFlag,
}: AiCaseSummaryProps) {
  const [rating, setRating] = useState<'good' | 'bad' | null>(null);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState('');

  const handleRate = (newRating: 'good' | 'bad') => {
    setRating(newRating);
    if (newRating === 'bad') {
      setShowCommentBox(true);
    } else {
      setShowCommentBox(false);
      setComment('');
      // Call onRate prop here with 'good'
      // onRate('good');
      console.log("Rated as Good"); // Placeholder
    }
  };

  const submitBadRating = () => {
    // Call onRate prop here with 'bad' and comment
    // onRate('bad', comment);
    console.log("Rated as Bad with comment:", comment); // Placeholder
    setShowCommentBox(false); // Optionally close after submit
  }

  const handleSpeak = () => {
    if (summary && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(summary);
      // Configure voice, rate, pitch etc. if needed
      // utterance.lang = 'en-US'; // Or detect language
      window.speechSynthesis.cancel(); // Cancel any previous speech
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported in your browser or summary is empty.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
                 <BrainCircuit className="mr-2 h-5 w-5 text-primary" />
                AI Case Summary
            </span>
            <TooltipProvider>
                 <Tooltip>
                     <TooltipTrigger asChild>
                         <Button variant="ghost" size="icon" onClick={handleSpeak} disabled={!summary || isLoading}>
                            <Volume2 className="h-4 w-4" />
                            <span className="sr-only">Read summary aloud</span>
                         </Button>
                     </TooltipTrigger>
                    <TooltipContent>
                        <p>Read summary aloud (TTS)</p>
                    </TooltipContent>
                 </Tooltip>
             </TooltipProvider>
        </CardTitle>
        <CardDescription>An AI-generated overview of the case details and evidence.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Generating summary...
          </div>
        )}
        {error && !isLoading && (
            <div className="flex items-center justify-center py-6 text-destructive">
                <AlertCircle className="mr-2 h-5 w-5" />
                {error}
            </div>
        )}
        {!isLoading && !error && summary && (
            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 bg-muted/30 p-4 rounded-md border border-border">
                {/* Use paragraphs or markdown renderer if summary is markdown */}
                {summary.split('\n').map((paragraph, index) => (
                   <p key={index}>{paragraph}</p>
                ))}
            </div>
        )}
         {!isLoading && !error && !summary && (
             <p className="text-muted-foreground py-6 text-center">No summary available yet. Click Regenerate to create one.</p>
         )}

        {/* Actions Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
           <TooltipProvider>
            <div className="flex gap-1">
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => handleRate('good')} className={rating === 'good' ? 'border-primary text-primary' : ''}>
                            <ThumbsUp className="h-4 w-4" />
                        </Button>
                     </TooltipTrigger>
                     <TooltipContent><p>Summary is helpful</p></TooltipContent>
                 </Tooltip>
                  <Tooltip>
                     <TooltipTrigger asChild>
                         <Button variant="outline" size="icon" onClick={() => handleRate('bad')} className={rating === 'bad' ? 'border-destructive text-destructive' : ''}>
                            <ThumbsDown className="h-4 w-4" />
                        </Button>
                     </TooltipTrigger>
                     <TooltipContent><p>Summary is unhelpful/biased</p></TooltipContent>
                 </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        {/* Add Flag functionality later */}
                        <Button variant="outline" size="icon" disabled>
                            <Flag className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Flag summary for review (Coming Soon)</p></TooltipContent>
                 </Tooltip>
            </div>
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="default" size="sm" onClick={onRegenerate} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : 'mr-2'}`} />
                        {!isLoading && <span className="hidden sm:inline">Regenerate</span>}
                    </Button>
                </TooltipTrigger>
                 <TooltipContent><p>Generate a new summary</p></TooltipContent>
             </Tooltip>
           </TooltipProvider>
        </div>

         {/* Comment box for bad rating */}
         {showCommentBox && rating === 'bad' && (
            <div className="mt-4 space-y-2">
                <Label htmlFor="rating-comment" className="text-sm font-medium">Provide feedback (optional):</Label>
                <Textarea
                    id="rating-comment"
                    placeholder="Why was the summary unhelpful or biased?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[60px]"
                />
                <Button size="sm" onClick={submitBadRating}>Submit Feedback</Button>
                <Button size="sm" variant="ghost" onClick={() => {setShowCommentBox(false); setRating(null); }}>Cancel</Button>
            </div>
         )}
      </CardContent>
    </Card>
  );
}

// Add Label import
import { Label } from "@/components/ui/label";
