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
        user: null,  // User profile information (contains userType and walletAddress)
        token: null, // Session token
        isAuthenticated: false,
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
          // Remove the duplicate walletAddress at the root level
        },
      })),
      
      logout: () => set((state) => ({
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          // Remove the deprecated walletAddress property
        },
      })),
      
      updateUser: (userData) => set((state) => ({
        auth: {
          ...state.auth,
          user: {
            ...state.auth.user,
            ...userData,
          }
          // Remove the duplicate walletAddress at the root level
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
export const useUserType = () => useStore((state) => state.auth.user?.userType);
export const useWalletAddress = () => useStore((state) => state.auth.user?.walletAddress);
export const useAppState = () => useStore((state) => state.app);
export const useCurrentDispute = () => useStore((state) => state.currentDispute);