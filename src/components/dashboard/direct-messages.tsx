"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Plus, Search, Paperclip, Send, MoreVertical, UserMinus, UserX, MessageSquarePlus, FileText } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DirectContact, useDirectChat } from "@/hooks/use-chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { format, formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { FindContactsDialog } from "./find-contacts-dialog";
import { CreateContractDialog } from "./create-contract-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DirectMessages() {
  const { user, userType } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("recent");
  const [activeContact, setActiveContact] = useState<DirectContact | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [attachment, setAttachment] = useState<{ name: string; url: string; type: string } | null>(null);
  const [findContactsOpen, setFindContactsOpen] = useState(false);
  const [createContractOpen, setCreateContractOpen] = useState(false);
  const [contractContact, setContractContact] = useState<DirectContact | null>(null);
  const [contactToRemove, setContactToRemove] = useState<DirectContact | null>(null);
  const [conversationOpen, setConversationOpen] = useState(false);
  const [contactSearch, setContactSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Use our custom hook for direct messages
  const {
    contacts,
    messages,
    isLoading,
    error,
    isConnected,
    loadContacts,
    loadMessageHistory,
    sendDirectMessage,
    updateContactLastMessage,
    removeContact
  } = useDirectChat(activeContact?._id);

  // Load contacts when component mounts
  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollAreaRef.current && messages.length > 0) {
      scrollAreaRef.current.scrollTo({ 
        top: scrollAreaRef.current.scrollHeight, 
        behavior: 'smooth' 
      });
    }
  }, [messages]);

  const handleContactSelect = (contact: DirectContact) => {
    setActiveContact(contact);
    
    // Mark messages as read
    if (contact.lastMessage) {
      updateContactLastMessage(
        contact._id,
        contact.lastMessage.text,
        contact.lastMessage.timestamp,
        true
      );
    }
    
    // Load message history
    loadMessageHistory(contact._id);
    setConversationOpen(true);
  };
  
  const handleSendMessage = () => {
    if (!activeContact || (!newMessage.trim() && !attachment)) return;
    
    sendDirectMessage(activeContact._id, newMessage, attachment);
    setNewMessage("");
    setAttachment(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle opening contract creation dialog
  const handleCreateContract = async (contact: DirectContact) => {
    // First set the basic contact info
    setContractContact(contact);
    
    try {
      // Get the auth token from localStorage
      
      
      // Fetch the full user profile to get their wallet address
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${contact._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        
        // Update the contract contact with the wallet address
        setContractContact(prevContact => ({
          ...prevContact!,
          walletAddress: userData.walletAddress
        }));
      } else {
        console.error('Failed to fetch contact wallet address');
      }
    } catch (error) {
      console.error('Error fetching contact details:', error);
    }
    
    // Open the dialog
    setCreateContractOpen(true);
  };

  const handleAttachment = () => {
    // Trigger file input
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // In a real implementation, you'd upload to your backend storage
    // For now, create a local URL for preview
    const fileType = file.type.startsWith('image/') ? 'image' : 'file';
    const fileUrl = URL.createObjectURL(file);
    
    setAttachment({
      name: file.name,
      url: fileUrl,
      type: fileType
    });
  };
  
  // Handle removing a contact
  const handleRemoveContact = async () => {
    if (!contactToRemove) return;
    
    const success = await removeContact(contactToRemove._id);
    
    if (success && activeContact?._id === contactToRemove._id) {
      // If we removed the active contact, clear the active contact
      setActiveContact(null);
      setConversationOpen(false);
    }
    
    setContactToRemove(null);
  };
  
  // Handle starting a conversation from the find contacts dialog
  const handleStartConversation = (contactId: string, contactName: string) => {
    // Find the contact from our contacts list
    const contact = contacts.find(c => c._id === contactId);
    
    if (contact) {
      handleContactSelect(contact);
    } else {
      // If contact was just added and not yet in our list, refresh contacts
      loadContacts().then(() => {
        // After contacts are reloaded, find the contact and select it
        const newContact = contacts.find(c => c._id === contactId);
        if (newContact) {
          handleContactSelect(newContact);
        }
      });
    }
  };

  // Filter contacts based on search term
  const filterContactsBySearch = (contacts: DirectContact[]) => {
    if (!contactSearch.trim()) return contacts;
    return contacts.filter(contact => 
      contact.username.toLowerCase().includes(contactSearch.toLowerCase())
    );
  };

  // Filter contacts based on the active tab
  const filteredContacts = filterContactsBySearch(contacts).filter(contact => {
    if (activeTab === "recent") return true;
    return contact.userType === activeTab.slice(0, -1); // Remove 's' from buyers/sellers
  });

  return (
    <>
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center">
            Messages
            {isConnected ? (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-md">Connected</span>
            ) : (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-md">Offline</span>
            )}
          </CardTitle>
          <CardDescription>Direct messages with other users</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search contacts..." 
              className="pl-8"
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
            />
          </div>
          
          <Tabs defaultValue="recent" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="recent" className="flex-1">Recent</TabsTrigger>
              <TabsTrigger value="buyers" className="flex-1">Buyers</TabsTrigger>
              <TabsTrigger value="sellers" className="flex-1">Sellers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recent" className="space-y-4">
              {isLoading ? (
                // Loading skeletons
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[60%]" />
                      <Skeleton className="h-3 w-[80%]" />
                    </div>
                  </div>
                ))
              ) : filteredContacts.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  {contactSearch ? 'No contacts match your search' : 'No contacts found'}
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      className="mx-auto"
                      onClick={() => setFindContactsOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Find Contacts
                    </Button>
                  </div>
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <Sheet key={contact._id} open={activeContact?._id === contact._id && conversationOpen} onOpenChange={setConversationOpen}>
                    <SheetTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start h-auto py-2 px-2 group"
                        onClick={() => handleContactSelect(contact)}
                      >
                        <div className="flex items-start w-full">
                          <Avatar className="h-10 w-10 mr-3">
                            {contact.isOnline && (
                              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background"></div>
                            )}
                            <AvatarFallback>
                              {contact.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 overflow-hidden">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{contact.username}</span>
                              {contact.lastMessage && (
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(contact.lastMessage.timestamp), 'p')}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center">
                              <p className="text-sm text-muted-foreground truncate">
                                {contact.lastMessage?.text || `${contact.userType.charAt(0).toUpperCase() + contact.userType.slice(1)}`}
                              </p>
                              {contact.lastMessage && !contact.lastMessage.isRead && (
                                <span className="ml-2 h-2 w-2 rounded-full bg-primary inline-block"></span>
                              )}
                            </div>
                          </div>
                          
                          {/* Contact actions menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">More options</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleContactSelect(contact);
                                }}
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Message
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCreateContract(contact);
                                }}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Create Contract
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer text-red-600 focus:text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setContactToRemove(contact);
                                }}
                              >
                                <UserMinus className="h-4 w-4 mr-2" />
                                Remove contact
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </Button>
                    </SheetTrigger>
                    {/*  */}
                  </Sheet>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="buyers" className="space-y-4">
              {isLoading ? (
                // Loading skeletons
                Array(2).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[60%]" />
                    </div>
                  </div>
                ))
              ) : filteredContacts.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  {contactSearch ? 'No buyer contacts match your search' : 'No buyer contacts'}
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      className="mx-auto"
                      onClick={() => setFindContactsOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Find Buyer Contacts
                    </Button>
                  </div>
                </div>
              ) : (
                // Reuse the same contact rendering logic
                filteredContacts.map((contact) => (
                  <div key={contact._id} className="flex items-center justify-between hover:bg-muted/50 rounded-md">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start h-auto py-2 px-2"
                      onClick={() => handleContactSelect(contact)}
                    >
                      <Avatar className="h-10 w-10 mr-3">
                        {contact.isOnline && (
                          <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-1 ring-background"></div>
                        )}
                        <AvatarFallback>
                          {contact.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div>{contact.username}</div>
                        {contact.lastMessage && (
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {contact.lastMessage.text}
                          </p>
                        )}
                      </div>
                    </Button>
                    
                    <div className="flex">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary hover:text-primary/80"
                        onClick={() => handleContactSelect(contact)}
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span className="sr-only">Message</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => handleCreateContract(contact)}
                      >
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">Create Contract</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setContactToRemove(contact)}
                      >
                        <UserX className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="sellers" className="space-y-4">
              {isLoading ? (
                // Loading skeletons
                Array(2).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[60%]" />
                    </div>
                  </div>
                ))
              ) : filteredContacts.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  {contactSearch ? 'No seller contacts match your search' : 'No seller contacts'}
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      className="mx-auto"
                      onClick={() => setFindContactsOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Find Seller Contacts
                    </Button>
                  </div>
                </div>
              ) : (
                // Reuse the same contact rendering logic
                filteredContacts.map((contact) => (
                  <div key={contact._id} className="flex items-center justify-between hover:bg-muted/50 rounded-md">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start h-auto py-2 px-2"
                      onClick={() => handleContactSelect(contact)}
                    >
                      <Avatar className="h-10 w-10 mr-3">
                        {contact.isOnline && (
                          <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-1 ring-background"></div>
                        )}
                        <AvatarFallback>
                          {contact.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div>{contact.username}</div>
                        {contact.lastMessage && (
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {contact.lastMessage.text}
                          </p>
                        )}
                      </div>
                    </Button>
                    
                    <div className="flex">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary hover:text-primary/80"
                        onClick={() => handleContactSelect(contact)}
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span className="sr-only">Message</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => handleCreateContract(contact)}
                      >
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">Create Contract</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setContactToRemove(contact)}
                      >
                        <UserX className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
          
          <div className="mt-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setFindContactsOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Find New Contacts
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Find Contacts Dialog */}
      <FindContactsDialog 
        open={findContactsOpen} 
        onOpenChange={setFindContactsOpen}
        onStartConversation={handleStartConversation}
      />
      
      {/* Create Contract Dialog */}
      <CreateContractDialog
        open={createContractOpen}
        onOpenChange={setCreateContractOpen}
        contactId={contractContact?._id}
        contactName={contractContact?.username}
        walletAddress={contractContact?.walletAddress}
      />
      
      {/* Remove Contact Confirmation Dialog */}
      <AlertDialog open={!!contactToRemove} onOpenChange={(open) => !open && setContactToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {contactToRemove?.username} from your contacts? 
              You can add them back later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleRemoveContact}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}