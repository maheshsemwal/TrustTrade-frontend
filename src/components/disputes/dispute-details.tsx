import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format, parseISO } from 'date-fns';

interface DisputeDetailsProps {
  dispute: {
    id: string;
    buyer: string;
    seller: string;
    buyerDescription: string;
    sellerDescription: string;
    filedDate: string; // ISO Date String
    // Add other relevant fields like amount, category etc.
  };
}

export default function DisputeDetails({ dispute }: DisputeDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dispute Details</CardTitle>
        <CardDescription>Filed on: {format(parseISO(dispute.filedDate), 'PPP p')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-1">Buyer's Claim ({dispute.buyer})</h3>
          <p className="text-muted-foreground">{dispute.buyerDescription}</p>
        </div>
         <hr className="border-border my-4"/>
        <div>
          <h3 className="font-semibold text-lg mb-1">Seller's Response ({dispute.seller})</h3>
          <p className="text-muted-foreground">{dispute.sellerDescription || <span className="italic">No response yet.</span>}</p>
        </div>
         {/* Add more details here */}
      </CardContent>
    </Card>
  );
}
