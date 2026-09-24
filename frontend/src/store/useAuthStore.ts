import { create } from 'zustand';
import axios from 'axios';

import { API_BASE_URL } from '../config/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,
  login: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token, isLoading: false });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isLoading: false });
  },
  restoreSession: async () => {
    const token = get().token;
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/api/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ user: response.data, isLoading: false });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null, isLoading: false });
    }
  },
}));
