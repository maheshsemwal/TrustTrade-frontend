"use client";

import { cn } from "@/lib/utils";
import { CheckCircle, CircleDot, Circle, Loader2, Clock, FileText, Scale, Award } from 'lucide-react';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { format, parseISO } from 'date-fns';

type TimelineStage = 'Filed' | 'Evidence' | 'Summary' | 'Voting' | 'Resolved';

type TimelineEvent = {
  stage: TimelineStage;
  timestamp: string | null; // ISO date string or null
  txHash: string | null;
};

interface DisputeTimelineProps {
  events: TimelineEvent[];
  currentStatus: string; // e.g., 'Pending Evidence', 'In Review', 'Resolved'
}

const stageOrder: TimelineStage[] = ['Filed', 'Evidence', 'Summary', 'Voting', 'Resolved'];

const stageIcons: Record<TimelineStage, React.ReactNode> = {
  Filed: <FileText className="h-5 w-5" />,
  Evidence: <Clock className="h-5 w-5" />,
  Summary: <Scale className="h-5 w-5" />, // Or BrainCircuit
  Voting: <CheckSquare className="h-5 w-5" />, // CheckSquare for voting
  Resolved: <Award className="h-5 w-5" />,
};

const stageStatusMapping: Record<string, TimelineStage> = {
    'Pending Evidence': 'Evidence',
    'Evidence Submitted': 'Evidence', // Assuming an intermediate status
    'In Review': 'Summary', // Or could be 'Voting' depending on flow
    'Voting Open': 'Voting',
    'Voting Closed': 'Voting', // After voting ends but before resolution
    'Resolved': 'Resolved',
    // Add more mappings as needed
}

export default function DisputeTimeline({ events, currentStatus }: DisputeTimelineProps) {
  const currentStageIndex = stageOrder.indexOf(stageStatusMapping[currentStatus] || 'Filed'); // Find current stage based on status, default to Filed

  const getStageData = (stage: TimelineStage): TimelineEvent | undefined => {
    return events.find(event => event.stage === stage);
  };

  const isStageComplete = (index: number) => index < currentStageIndex;
  const isStageActive = (index: number) => index === currentStageIndex;
  const isStageFuture = (index: number) => index > currentStageIndex;

  const getIcon = (index: number, stage: TimelineStage) => {
    const eventData = getStageData(stage);
    const completed = isStageComplete(index) || (isStageActive(index) && eventData?.timestamp != null); // Consider active stage complete if timestamp exists
    const active = isStageActive(index) && !completed; // Active only if no timestamp yet

    if (completed) return <CheckCircle className="h-5 w-5 text-primary" />;
    if (active) return <CircleDot className="h-5 w-5 text-yellow-500 animate-pulse" />; // Active stage indication
    // if (isStageFuture(index)) return <Circle className="h-5 w-5 text-muted-foreground/50" />;
    return <Circle className="h-5 w-5 text-muted-foreground/50" />; // Default/Future
  };

  return (
    <Card className="overflow-hidden">
        <CardHeader>
            <CardTitle>Dispute Timeline</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
            <TooltipProvider>
                <div className="relative flex items-center justify-between">
                    {/* Timeline Line */}
                    <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-border">
                         {/* Progress Fill */}
                         <div
                            className="absolute h-full bg-primary transition-all duration-500 ease-out"
                            style={{ width: `${(currentStageIndex / (stageOrder.length - 1)) * 100}%` }}
                        />
                    </div>

                    {stageOrder.map((stage, index) => {
                    const eventData = getStageData(stage);
                    const icon = getIcon(index, stage);
                    const stageIsComplete = isStageComplete(index) || (isStageActive(index) && eventData?.timestamp != null);
                    const stageIsActive = isStageActive(index) && !stageIsComplete;

                    return (
                        <Tooltip key={stage}>
                        <TooltipTrigger asChild>
                            <div className="relative z-10 flex flex-col items-center">
                                <div
                                    className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background transition-colors",
                                    stageIsComplete ? "border-primary" : "border-border",
                                    stageIsActive ? "border-yellow-500" : "",
                                    // isStageFuture(index) ? "border-border" : "border-primary"
                                    )}
                                >
                                     <span className={cn(stageIsComplete ? "text-primary" : "text-muted-foreground", stageIsActive ? "text-yellow-500" : "")}>
                                        {stageIcons[stage]}
                                    </span>
                                </div>
                                <span className={cn(
                                    "mt-2 text-xs font-medium",
                                    stageIsComplete ? "text-primary" : "text-muted-foreground",
                                    stageIsActive ? "text-yellow-500" : ""
                                    )}>
                                    {stage}
                                </span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p className="font-semibold">{stage}</p>
                            {eventData?.timestamp ? (
                                <p className="text-sm text-muted-foreground">
                                Completed: {format(parseISO(eventData.timestamp), 'MMM d, yyyy HH:mm')}
                                </p>
                            ) : stageIsActive ? (
                                <p className="text-sm text-yellow-500">Current Stage</p>
                            ) : (
                                <p className="text-sm text-muted-foreground">Pending</p>
                            )}
                             {eventData?.txHash && (
                                <Link href={`/tx/${eventData.txHash}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1 block">
                                    View Tx: {eventData.txHash.substring(0, 6)}...{eventData.txHash.substring(eventData.txHash.length - 4)}
                                </Link>
                            )}
                        </TooltipContent>
                        </Tooltip>
                    );
                    })}
                </div>
            </TooltipProvider>
        </CardContent>
    </Card>
  );
}

// Add imports for Card components if not automatically added
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare } from 'lucide-react'; // Import CheckSquare
