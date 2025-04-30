import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Main application store using Zustand
 * Handles:
 * - Authentication state (user info, tokens)
 * - App settings and preferences
 * - UI state management
 * - Persists selected data to localStorage
 */
export const useStore = create(
  persist(
    (set, get) => ({
      // Authentication state
      auth: {
        user: null,  // User profile information
        token: null, // Session token
        isAuthenticated: false,
        userType: null, // 'buyer', 'seller', 'arbitrator'
        walletAddress: null, // User's wallet address
      },
      
      // Application state
      app: {
        isLoading: false,
        darkMode: false,
        notifications: [],
      },
      
      // Current active dispute
      currentDispute: null,
      
      // Authentication actions
      login: (userData, token) => set((state) => ({
        auth: {
          ...state.auth,
          user: userData,
          token: token,
          isAuthenticated: true,
          userType: userData.userType || null,
          walletAddress: userData.walletAddress || null,
        },
      })),
      
      logout: () => set((state) => ({
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          userType: null,
          walletAddress: null,
        },
      })),
      
      updateUser: (userData) => set((state) => ({
        auth: {
          ...state.auth,
          user: {
            ...state.auth.user,
            ...userData,
          },
          walletAddress: userData.walletAddress || state.auth.walletAddress,
        },
      })),
      
      // App state actions
      setLoading: (isLoading) => set((state) => ({
        app: {
          ...state.app,
          isLoading,
        },
      })),
      
      toggleDarkMode: () => set((state) => ({
        app: {
          ...state.app,
          darkMode: !state.app.darkMode,
        },
      })),
      
      addNotification: (notification) => set((state) => ({
        app: {
          ...state.app,
          notifications: [...state.app.notifications, notification],
        },
      })),
      
      clearNotifications: () => set((state) => ({
        app: {
          ...state.app,
          notifications: [],
        },
      })),
      
      // Dispute management
      setCurrentDispute: (dispute) => set({ currentDispute: dispute }),
      
      updateDisputeData: (disputeData) => set((state) => ({
        currentDispute: state.currentDispute 
          ? { ...state.currentDispute, ...disputeData } 
          : disputeData,
      })),
    }),
    {
      name: 'trusttrade-storage', // unique name for localStorage
      storage: createJSONStorage(() => localStorage),
      // Only persist authentication and user preferences
      partialize: (state) => ({
        auth: { 
          user: state.auth.user, 
          token: state.auth.token, 
          isAuthenticated: state.auth.isAuthenticated,
          userType: state.auth.userType,
          walletAddress: state.auth.walletAddress,
        },
        app: {
          darkMode: state.app.darkMode
        }
      }),
    }
  )
);

// Selectors for common state access
export const useAuth = () => useStore((state) => state.auth);
export const useUser = () => useStore((state) => state.auth.user);
export const useToken = () => useStore((state) => state.auth.token);
export const useIsAuthenticated = () => useStore((state) => state.auth.isAuthenticated);
export const useUserType = () => useStore((state) => state.auth.userType);
export const useWalletAddress = () => useStore((state) => state.auth.walletAddress);
export const useAppState = () => useStore((state) => state.app);
export const useCurrentDispute = () => useStore((state) => state.currentDispute);