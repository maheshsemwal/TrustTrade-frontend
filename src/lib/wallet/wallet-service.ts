import axios from 'axios';
import { useStore } from '../store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Service for wallet-related operations
 */
export const WalletService = {
  /**
   * Get wallet address for a specific user
   * @param {string} userId - User ID to get wallet address for
   * @returns {Promise<{username: string, walletAddress: string}>} - User wallet data
   */
  getUserWalletAddress: async (userId: string) => {
    try {
      const token = useStore.getState().auth.token;
      
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      // Set authorization header
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      const response = await axios.get(`${API_BASE_URL}/api/users/wallet/${userId}`, config);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching user wallet address:', error);
      throw error;
    }
  }
};