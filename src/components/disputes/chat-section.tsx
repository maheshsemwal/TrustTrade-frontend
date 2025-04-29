"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Paperclip, Send } from 'lucide-react';
import { useState, useRef, useEffect } from "react";
import { format } from 'date-fns'; // For timestamps

interface Message {
    id: string;
    sender: 'buyer' | 'seller' | 'system';
    text: string;
    timestamp: string; // ISO Date string
    attachment?: { name: string; url: string; type: 'image' | 'pdf' | 'other' }; // Optional attachment
}

// Mock messages - Replace with real-time data fetching (e.g., WebSockets)
const mockMessages: Message[] = [
    { id: 'm1', sender: 'buyer', text: 'The item arrived damaged.', timestamp: '2024-07-21T10:05:00Z' },
    { id: 'm2', sender: 'seller', text: 'Can you please provide photos of the damage?', timestamp: '2024-07-21T10:15:00Z' },
     { id: 'm3', sender: 'buyer', text: 'Yes, attaching now.', timestamp: '2024-07-21T10:20:00Z', attachment: {name: "damage.jpg", url: "https://picsum.photos/seed/damage/100/100", type: "image"} },
    { id: 'm4', sender: 'seller', text: 'Thank you. Reviewing the evidence.', timestamp: '2024-07-21T10:25:00Z' },
     { id: 'm5', sender: 'system', text: 'Seller submitted additional evidence: Shipping Manifest PDF.', timestamp: '2024-07-22T09:00:00Z' },
];

// Assume user identity (replace with actual user context)
const currentUserRole: 'buyer' | 'seller' = 'buyer';

export default function ChatSection({ disputeId }: { disputeId: string }) {
    const [messages, setMessages] = useState<Message[]>(mockMessages);
    const [newMessage, setNewMessage] = useState("");
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom on new message
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = () => {
        if (newMessage.trim() === "") return;

        const messageToSend: Message = {
            id: `m${messages.length + 1}`,
            sender: currentUserRole,
            text: newMessage,
            timestamp: new Date().toISOString(),
        };

        // Simulate sending message (replace with actual API/WebSocket call)
        setMessages([...messages, messageToSend]);
        setNewMessage("");

        // Simulate receiving a response after a delay (for demo)
        // setTimeout(() => {
        //     const response: Message = {
        //         id: `m${messages.length + 2}`,
        //         sender: currentUserRole === 'buyer' ? 'seller' : 'buyer',
        //         text: "Okay, I see.",
        //         timestamp: new Date().toISOString(),
        //     };
        //     setMessages(prev => [...prev, response]);
        // }, 1500);
    };

     const handleAttachment = () => {
         // Trigger file input or attachment logic
         alert("Attachment feature not implemented yet.");
     }

    return (
        <Card className="h-[600px] flex flex-col"> {/* Fixed height for chat */}
            <CardHeader>
                <CardTitle>Dispute Chat</CardTitle>
                <CardDescription>Secure communication between buyer and seller. Messages are recorded.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex items-start gap-3 ${msg.sender === currentUserRole ? 'justify-end' : ''} ${msg.sender === 'system' ? 'justify-center' : ''}`}
                            >
                                {msg.sender !== currentUserRole && msg.sender !== 'system' && (
                                    <Avatar className="h-8 w-8 border">
                                        {/* Placeholder - use actual avatars if available */}
                                        <AvatarFallback>{msg.sender === 'buyer' ? 'B' : 'S'}</AvatarFallback>
                                    </Avatar>
                                )}
                                 {msg.sender === 'system' ? (
                                     <div className="text-center text-xs text-muted-foreground italic bg-muted p-2 rounded-md w-full max-w-md mx-auto">
                                        {msg.text} - {format(parseISO(msg.timestamp), 'p')}
                                     </div>
                                 ) : (
                                    <div className={`max-w-[70%] space-y-1 ${msg.sender === currentUserRole ? 'text-right' : ''}`}>
                                        <div className={`rounded-lg p-3 text-sm ${
                                            msg.sender === currentUserRole ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                        }`}>
                                            <p className="whitespace-pre-wrap">{msg.text}</p>
                                             {msg.attachment && (
                                                 <a href={msg.attachment.url} target="_blank" rel="noopener noreferrer" className={`flex items-center mt-2 text-xs ${msg.sender === currentUserRole ? 'text-primary-foreground/80 hover:text-primary-foreground' : 'text-primary hover:underline'}`}>
                                                     <Paperclip className="h-3 w-3 mr-1" /> {msg.attachment.name}
                                                 </a>
                                             )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {format(parseISO(msg.timestamp), 'p')}
                                        </p>
                                    </div>
                                 )}

                                {msg.sender === currentUserRole && (
                                     <Avatar className="h-8 w-8 border">
                                        <AvatarFallback>{currentUserRole === 'buyer' ? 'B' : 'S'}</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t border-border flex items-center gap-2 bg-background">
                    <Button variant="ghost" size="icon" onClick={handleAttachment}>
                        <Paperclip className="h-5 w-5" />
                        <span className="sr-only">Attach file</span>
                    </Button>
                    <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1"
                    />
                    <Button onClick={handleSendMessage} size="icon" disabled={!newMessage.trim()}>
                        <Send className="h-5 w-5" />
                        <span className="sr-only">Send message</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

// Ensure date-fns is installed or add `npm install date-fns`
// Need parseISO from date-fns
import { parseISO } from 'date-fns';
