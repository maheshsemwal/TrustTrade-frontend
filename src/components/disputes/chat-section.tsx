"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Paperclip, Send, AlertCircle } from 'lucide-react';
import { useState, useRef, useEffect } from "react";
import { format } from 'date-fns'; // For timestamps
import { parseISO } from 'date-fns';
import { useChat, ChatMessage } from "@/hooks/use-chat";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChatSection({ disputeId }: { disputeId: string }) {
    const { 
        messages, 
        isLoading, 
        error, 
        isConnected,
        sendMessage, 
        userType 
    } = useChat(disputeId);
    
    const [newMessage, setNewMessage] = useState("");
    const [attachment, setAttachment] = useState<{ name: string; url: string; type: string } | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollAreaRef.current && messages.length > 0) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = () => {
        if (newMessage.trim() === "" && !attachment) return;
        
        sendMessage(newMessage, attachment || undefined);
        setNewMessage("");
        setAttachment(null);
    };

    const handleAttachment = () => {
        // Trigger file input
        fileInputRef.current?.click();
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        // In production, upload to your storage service and get URL
        // This is a mock implementation
        const mockFileUpload = () => {
            // Determine file type
            let type: 'image' | 'pdf' | 'other' = 'other';
            if (file.type.startsWith('image/')) type = 'image';
            else if (file.type === 'application/pdf') type = 'pdf';
            
            // Mock URL - In production, replace with actual upload
            const url = URL.createObjectURL(file);
            
            return {
                name: file.name,
                url,
                type
            };
        };
        
        // Set attachment
        setAttachment(mockFileUpload());
        
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Show loading state
    if (isLoading) {
        return (
            <Card className="h-[600px] flex flex-col">
                <CardHeader>
                    <CardTitle>Dispute Chat</CardTitle>
                    <CardDescription>Loading messages...</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 p-4">
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-start gap-3">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="space-y-1">
                                    <Skeleton className="h-14 w-52" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    // Current user's role from auth context
    const currentUserRole = userType as 'buyer' | 'seller';

    return (
        <Card className="h-[600px] flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    Dispute Chat
                    {isConnected ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-md">Connected</span>
                    ) : (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-md">Disconnected</span>
                    )}
                </CardTitle>
                <CardDescription>Secure communication between buyer and seller. Messages are recorded.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                {error && (
                    <Alert variant="destructive" className="m-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {messages.length === 0 ? (
                            <div className="text-center text-muted-foreground p-4">
                                No messages yet. Start the conversation.
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex items-start gap-3 ${
                                        msg.sender === currentUserRole ? 'justify-end' : ''
                                    } ${msg.sender === 'system' ? 'justify-center' : ''}`}
                                >
                                    {msg.sender !== currentUserRole && msg.sender !== 'system' && (
                                        <Avatar className="h-8 w-8 border">
                                            <AvatarFallback>
                                                {msg.sender === 'buyer' ? 'B' : 'S'}
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                    
                                    {msg.sender === 'system' ? (
                                        <div className="text-center text-xs text-muted-foreground italic bg-muted p-2 rounded-md w-full max-w-md mx-auto">
                                            {msg.text} - {format(parseISO(msg.timestamp), 'p')}
                                        </div>
                                    ) : (
                                        <div className={`max-w-[70%] space-y-1 ${
                                            msg.sender === currentUserRole ? 'text-right' : ''
                                        }`}>
                                            <div className={`rounded-lg p-3 text-sm ${
                                                msg.sender === currentUserRole 
                                                ? 'bg-primary text-primary-foreground' 
                                                : 'bg-muted'
                                            }`}>
                                                <p className="whitespace-pre-wrap">{msg.text}</p>
                                                {msg.attachment && (
                                                    <a 
                                                        href={msg.attachment.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className={`flex items-center mt-2 text-xs ${
                                                            msg.sender === currentUserRole 
                                                            ? 'text-primary-foreground/80 hover:text-primary-foreground' 
                                                            : 'text-primary hover:underline'
                                                        }`}
                                                    >
                                                        <Paperclip className="h-3 w-3 mr-1" /> 
                                                        {msg.attachment.name}
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
                                            <AvatarFallback>
                                                {currentUserRole === 'buyer' ? 'B' : 'S'}
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))
                        )}
                        
                        {attachment && (
                            <div className="flex justify-end">
                                <div className="bg-muted p-2 rounded-md flex items-center gap-2 max-w-[70%]">
                                    <Paperclip className="h-4 w-4" /> 
                                    <span className="text-sm">{attachment.name}</span>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => setAttachment(null)}
                                        className="h-5 p-0"
                                    >
                                        &times;
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
                
                <div className="p-4 border-t border-border flex items-center gap-2 bg-background">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.txt"
                    />
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleAttachment} 
                        // disabled={!isConnected}
                    >
                        <Paperclip className="h-5 w-5" />
                        <span className="sr-only">Attach file</span>
                    </Button>
                    <Input
                        placeholder={"Type your message..."}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1"
                        // disabled={!isConnected}
                    />
                    <Button 
                        onClick={handleSendMessage} 
                        size="icon" 
                        // disabled={(!newMessage.trim() && !attachment) || !isConnected}
                    >
                        <Send className="h-5 w-5" />
                        <span className="sr-only">Send message</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
