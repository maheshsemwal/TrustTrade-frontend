import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { socketService } from '@/lib/socket';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

// API base URL - must match your API endpoint
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  receiver?: string;
  timestamp: string;
  attachment?: {
    name: string;
    url: string;
    type: string;
  };
  readBy?: string[];
}

export interface DirectContact {
  _id: string;
  username: string;
  email: string;
  userType: 'buyer' | 'seller' | 'arbitrator';
  isOnline?: boolean;
  lastSeen?: string;
  lastMessage?: {
    text: string;
    timestamp: string;
    isRead: boolean;
  };
}

interface UseChatOptions {
  limit?: number;
  autoConnect?: boolean;
}

/**
 * Hook for direct messaging functionality
 */
export const useDirectChat = (contactId?: string, options: UseChatOptions = {}) => {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const { limit = 50, autoConnect = true } = options;
  
  const [contacts, setContacts] = useState<DirectContact[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Load contacts from the API
  const loadContacts = useCallback(async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/chat/contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Transform the response to match our DirectContact interface
      const contactsData = response.data.map((contact: any) => ({
        _id: contact._id,
        username: contact.username,
        email: contact.email,
        userType: contact.userType || 'buyer',
        isOnline: contact.isOnline || false,
        lastSeen: contact.lastSeen,
        // We'll set lastMessage via socket events
      }));
      
      setContacts(contactsData);
    } catch (err: any) {
      console.error('Failed to load contacts:', err);
      setError(err.response?.data?.msg || 'Failed to load contacts');
      toast({
        title: 'Error',
        description: 'Failed to load your contacts',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [token, toast]);

  // Add a user to contacts
  const addContact = useCallback(async (userId: string) => {
    if (!token) return false;
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/users/contacts/add/${userId}`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the contacts list with the new data
      if (response.data.contacts) {
        const updatedContacts = response.data.contacts.map((contact: any) => ({
          _id: contact._id,
          username: contact.username,
          email: contact.email,
          userType: contact.userType || 'buyer',
          isOnline: contact.isOnline || false,
          lastSeen: contact.lastSeen,
        }));
        
        setContacts(updatedContacts);
      }
      
      toast({
        title: 'Success',
        description: 'User added to your contacts',
      });
      
      return true;
    } catch (err: any) {
      console.error('Failed to add contact:', err);
      const errorMessage = err.response?.data?.msg || 'Failed to add user to contacts';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      return false;
    }
  }, [token, toast]);

  // Remove a user from contacts
  const removeContact = useCallback(async (userId: string) => {
    if (!token) return false;
    
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/users/contacts/remove/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the contacts list
      if (response.data.contacts) {
        const updatedContacts = response.data.contacts.map((contact: any) => ({
          _id: contact._id,
          username: contact.username,
          email: contact.email,
          userType: contact.userType || 'buyer',
          isOnline: contact.isOnline || false,
          lastSeen: contact.lastSeen,
        }));
        
        setContacts(updatedContacts);
      }
      
      toast({
        title: 'Success',
        description: 'User removed from your contacts',
      });
      
      return true;
    } catch (err: any) {
      console.error('Failed to remove contact:', err);
      const errorMessage = err.response?.data?.msg || 'Failed to remove user from contacts';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      return false;
    }
  }, [token, toast]);

  // Load message history with a specific contact
  const loadMessageHistory = useCallback(async (userId: string) => {
    if (!token || !userId) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/chat/direct/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit }
      });
      
      // Transform the messages to match our ChatMessage interface
      const messageHistory = response.data.messages.map((msg: any) => ({
        id: msg._id,
        text: msg.content,
        sender: msg.sender.userType || (msg.sender._id === user?.id ? user.userType : 'other'),
        timestamp: msg.createdAt,
        attachment: msg.fileUrl ? {
          name: msg.fileName || 'attachment',
          url: msg.fileUrl,
          type: msg.fileUrl.endsWith('.jpg') || msg.fileUrl.endsWith('.png') ? 'image' : 'file'
        } : undefined,
        readBy: msg.readBy
      }));
      
      setMessages(messageHistory);
    } catch (err: any) {
      console.error('Failed to load message history:', err);
      setError(err.response?.data?.msg || 'Failed to load message history');
    } finally {
      setIsLoading(false);
    }
  }, [token, limit, user?.id, user?.userType]);

  // Send a direct message to a user
  const sendDirectMessage = useCallback(async (receiverId: string, content: string, fileData?: any) => {
    if (!token || !receiverId) return null;
    
    try {
      const data: any = { content };
      
      // Handle file attachment if present
      if (fileData) {
        data.messageType = fileData.type === 'image' ? 'image' : 'file';
        data.fileData = fileData;
      }
      
      const response = await axios.post(`${API_BASE_URL}/api/chat/direct/${receiverId}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Add the new message to the local state
      const newMessage: ChatMessage = {
        id: response.data._id,
        text: response.data.content,
        sender: user?.userType || 'buyer',
        timestamp: response.data.createdAt,
        attachment: fileData
      };
      
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.response?.data?.msg || 'Failed to send message');
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
      return null;
    }
  }, [token, user?.userType, toast]);

  // Update a contact's last message
  const updateContactLastMessage = useCallback((contactId: string, text: string, timestamp: string, isRead: boolean) => {
    setContacts(prev => prev.map(contact => 
      contact._id === contactId 
      ? {
          ...contact,
          lastMessage: {
            text,
            timestamp,
            isRead
          }
        }
      : contact
    ));
  }, []);

  // Setup socket connection
  useEffect(() => {
    if (!token || !autoConnect) return;
    
    const socket = socketService.initialize();
    
    // Set up event listeners
    socket.on('connect', () => {
      setIsConnected(true);
      // Request contacts list on connection
      socket.emit('direct:contacts');
    });
    
    socket.on('disconnect', () => {
      setIsConnected(false);
    });
    
    socket.on('direct:contacts', (contactList: DirectContact[]) => {
      setContacts(contactList);
    });
    
    socket.on('direct:message', (message: ChatMessage) => {
      // Add the message to our local state if it's related to our current chat
      if (contactId && 
          (message.sender === contactId || message.receiver === contactId)) {
        setMessages(prev => [...prev, message]);
      }
      
      // Update the contact's last message
      if (message.sender !== user?.id) {
        updateContactLastMessage(
          message.sender,
          message.text,
          message.timestamp,
          contactId === message.sender // is read if we're currently viewing this contact
        );
      }
    });
    
    // Clean up on unmount
    return () => {
      socket.off('direct:contacts');
      socket.off('direct:message');
    };
  }, [token, autoConnect, contactId, user?.id, updateContactLastMessage]);
  
  return {
    contacts,
    messages,
    isLoading,
    error,
    isConnected,
    loadContacts,
    loadMessageHistory,
    sendDirectMessage,
    updateContactLastMessage,
    addContact,
    removeContact
  };
};

// For dispute chat functionality (existing implementation)
export const useChat = (disputeId: string) => {
  // Implementation for dispute chat which you already have
  // This is a placeholder to avoid breaking existing code
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { userType } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Initialize the socket connection
  useEffect(() => {
    const socket = socketService.initialize();
    
    // Join the dispute room
    socket.emit('join:dispute', { disputeId });
    
    // Check connection status
    setIsConnected(socket.connected);
    
    // Listen for connection status changes
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    
    // Listen for messages
    socket.on('message:receive', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    });
    
    // Clean up on unmount
    return () => {
      socket.off('message:receive');
      socketService.leaveDisputeRoom();
    };
  }, [disputeId]);
  
  const sendMessage = (text: string, attachment?: any) => {
    if (!text.trim() && !attachment) return;
    
    socketService.sendMessage({
      text,
      disputeId,
      attachment
    });
  };
  
  return {
    messages,
    isLoading,
    error,
    isConnected,
    sendMessage,
    userType
  };
};