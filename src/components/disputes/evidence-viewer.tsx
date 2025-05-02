import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Image from 'next/image';
import { FileText, Image as ImageIcon, Volume2, Paperclip } from 'lucide-react';

type EvidenceType = 'text' | 'image' | 'pdf' | 'audio';

interface EvidenceItem {
  type: EvidenceType;
  content: string; // Could be text, URL (for image), or data URI (pdf/audio)
  description?: string;
  // Add submitter (buyer/seller) and timestamp if available
}

interface EvidenceViewerProps {
  evidence: EvidenceItem[];
}

export default function EvidenceViewer({ evidence }: EvidenceViewerProps) {

  const renderEvidenceContent = (item: EvidenceItem) => {
    switch (item.type) {
      case 'image':
        return (
          <div className="my-2">
             <Image
                src={item.content} // Assuming content is a URL for images
                alt={item.description || 'Evidence Image'}
                width={300}
                height={200}
                className="rounded-md object-cover border border-border"
            />
          </div>
        );
      case 'pdf':
        return (
          <a
            href={item.content} // Assuming content is a data URI or link
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline flex items-center my-2"
          >
            <FileText className="mr-2 h-4 w-4" /> View PDF Document
          </a>
        );
      case 'audio':
        return (
            <div className="my-2">
                 <audio controls src={item.content} className="w-full">
                    Your browser does not support the audio element.
                </audio>
            </div>
        );
      case 'text':
        return <p className="text-muted-foreground whitespace-pre-wrap my-2">{item.content}</p>;
      default:
        return <p className="text-destructive">Unsupported evidence type.</p>;
    }
  };

   const getIconForType = (type: EvidenceType) => {
     switch (type) {
       case 'image': return <ImageIcon className="h-4 w-4 mr-2 text-blue-500" />;
       case 'pdf': return <FileText className="h-4 w-4 mr-2 text-red-500" />;
       case 'audio': return <Volume2 className="h-4 w-4 mr-2 text-green-500" />;
       case 'text': return <FileText className="h-4 w-4 mr-2 text-gray-500" />;
       default: return <Paperclip className="h-4 w-4 mr-2" />;
     }
   }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submitted Evidence</CardTitle>
        <CardDescription>Review the evidence provided by both parties.</CardDescription>
      </CardHeader>
      <CardContent>
        {evidence.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No evidence submitted yet.</p>
        ) : (
          <Accordion type="multiple" className="w-full space-y-2">
            {evidence.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-md px-4 bg-card hover:bg-muted/50">
                <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
                  <span className="flex items-center">
                     {getIconForType(item.type)}
                     Evidence #{index + 1}: {item.description || `(${item.type})`}
                  </span>

                </AccordionTrigger>
                <AccordionContent className="pt-0 pb-3 text-sm">
                  {renderEvidenceContent(item)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
        {/* Add button for submitting evidence if applicable for the user role */}
        {/* <Button className="mt-4">Submit New Evidence</Button> */}
      </CardContent>
    </Card>
  );
}
