"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, UserPlus, AlertCircle, Check, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useDirectChat } from "@/hooks/use-chat";

// API base URL - must match your API endpoint
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface FindContactsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartConversation?: (contactId: string, contactName: string) => void;
}

interface UserSearchResult {
  _id: string;
  username: string;
  userType: string;
  walletAddress?: string;
  isContact: boolean;
}

export function FindContactsDialog({ open, onOpenChange, onStartConversation }: FindContactsDialogProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [addingUser, setAddingUser] = useState<string | null>(null);

  // Use our custom hook for direct chat functionality
  const { addContact, contacts, loadContacts } = useDirectChat();

  // Load contacts when the dialog opens
  useEffect(() => {
    if (open) {
      loadContacts();
    }
  }, [open, loadContacts]);

  // Search for users based on the search term
  const handleSearch = async () => {
    if (!searchTerm.trim() || !token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter users based on search term
      let results = response.data.filter((user: any) => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Mark users that are already contacts
      results = results.map((user: any) => ({
        _id: user._id,
        username: user.username,
        userType: user.userType || 'buyer',
        walletAddress: user.walletAddress,
        isContact: contacts.some(contact => contact._id === user._id)
      }));
      
      setSearchResults(results);
    } catch (err: any) {
      console.error('User search failed:', err);
      setError(err.response?.data?.msg || 'Failed to search for users');
      toast({
        title: 'Error',
        description: 'Failed to search for users',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a user to contacts
  const handleAddContact = async (userId: string, username: string) => {
    setAddingUser(userId);
    
    const success = await addContact(userId);
    
    if (success) {
      // Update isContact for this user in search results
      setSearchResults(prev => 
        prev.map(user => 
          user._id === userId ? { ...user, isContact: true } : user
        )
      );
      
      toast({
        title: "Contact added",
        description: `${username} has been added to your contacts.`,
      });
    }
    
    setAddingUser(null);
  };
  
  // Handle starting a conversation with a contact
  const handleStartConversation = (userId: string, username: string) => {
    if (onStartConversation) {
      onStartConversation(userId, username);
      onOpenChange(false);
    }
  };

  // Filter users based on the selected tab
  const filteredResults = searchResults.filter(user => {
    if (activeTab === 'all') return true;
    if (activeTab === 'buyers') return user.userType === 'buyer';
    if (activeTab === 'sellers') return user.userType === 'seller';
    if (activeTab === 'arbitrators') return user.userType === 'arbitrator';
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Find Contacts</DialogTitle>
          <DialogDescription>
            Search for users to add to your contacts
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-8"
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoading || !searchTerm.trim()}>
            Search
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
            <TabsTrigger value="buyers" className="flex-1">Buyers</TabsTrigger>
            <TabsTrigger value="sellers" className="flex-1">Sellers</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            <Card>
              <ScrollArea className="h-[300px]">
                <div className="p-2 space-y-2">
                  {isLoading ? (
                    // Loading skeletons
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-2">
                        <div className="flex items-center">
                          <Skeleton className="h-10 w-10 rounded-full mr-3" />
                          <div>
                            <Skeleton className="h-4 w-24 mb-1" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                        <Skeleton className="h-8 w-16" />
                      </div>
                    ))
                  ) : searchResults.length === 0 ? (
                    <div className="text-center text-muted-foreground py-6">
                      {searchTerm ? 'No users found' : 'Search for users to add them to your contacts'}
                    </div>
                  ) : filteredResults.length === 0 ? (
                    <div className="text-center text-muted-foreground py-6">
                      No users match the selected filter
                    </div>
                  ) : (
                    filteredResults.map(user => (
                      <div key={user._id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarFallback>
                              {user.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.username}</p>
                            <p className="text-xs text-muted-foreground capitalize">{user.userType}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {user.isContact ? (
                            <>
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                disabled 
                                className="gap-1"
                              >
                                <Check className="h-4 w-4" /> Added
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStartConversation(user._id, user.username)}
                                className="gap-1"
                              >
                                <MessageCircle className="h-4 w-4" /> Message
                              </Button>
                            </>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleAddContact(user._id, user.username)}
                              disabled={addingUser === user._id}
                              className="gap-1"
                            >
                              <UserPlus className="h-4 w-4" /> 
                              {addingUser === user._id ? 'Adding...' : 'Add'}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}