'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { socketService } from '@/lib/socket';
import { useToast } from '@/hooks/use-toast';

export default function ConnectionDiagnostic() {
    const [status, setStatus] = useState({
        connected: false,
        socketId: null as string | null,
        transport: null as string | null,
        timestamp: new Date().toISOString(),
    });
    const { toast } = useToast();

    // Update status periodically
    useEffect(() => {
        const updateStatus = () => {
            const isConnected = socketService.isConnected();
            setStatus({
                connected: isConnected,
                socketId: socketService.getSocketId(),
                transport: socketService.getTransport(),
                timestamp: new Date().toISOString(),
            });
        };
        
        // Update immediately
        updateStatus();
        
        // Then update every 3 seconds
        const interval = setInterval(updateStatus, 3000);
        
        return () => clearInterval(interval);
    }, []);

    const handleForceReconnect = () => {
        toast({
            title: "Reconnecting...",
            description: "Forcing WebSocket reconnection",
        });
        socketService.forceReconnect();
    };

    return (
        <Card className="mb-6">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>Connection Status</span>
                    <Badge 
                        variant={status.connected ? "default" : "destructive"}
                        className="ml-2"
                    >
                        {status.connected ? "Connected" : "Disconnected"}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <span className="font-semibold">Socket ID:</span>
                    </div>
                    <div className="col-span-2 truncate">
                        {status.socketId || 'None'}
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <span className="font-semibold">Transport:</span>
                    </div>
                    <div className="col-span-2">
                        {status.transport === 'websocket' ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                WebSocket
                            </Badge>
                        ) : status.transport === 'polling' ? (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                HTTP Polling
                            </Badge>
                        ) : (
                            'Unknown'
                        )}
                    </div>
                </div>
                <div className="pt-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleForceReconnect}
                        className="w-full text-xs"
                    >
                        Force WebSocket Reconnection
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}