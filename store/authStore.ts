import { create } from 'zustand';

export interface User {
  _id: string;

  employeeId: string;
  name: string;
  gender?: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;

  email: string;
  phone: string;

  role: 'admin' | 'employee';

  department: string;
  designation: string;
  joiningDate?: string;

  address: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };

  documents: {
    aadhaarNumber: string;
    panNumber: string;
    drivingLicenseNumber: string;
  };

  bank: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branchName: string;
    accountType: 'Savings' | 'Current';
  };

  avatar: string;

  status: 'active' | 'inactive';

  createdAt: string;
  updatedAt: string;
}

interface AuthStore {
  user: User | null;
  loading: boolean;

  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;

  fetchUser: () => Promise<void>;

  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,

  loading: true,

  setUser: (user) => set({ user }),

  setLoading: (loading) => set({ loading }),

  fetchUser: async () => {
    try {
      set({ loading: true });

      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (!res.ok) {
        set({ user: null, loading: false });
        return;
      }

      const user = await res.json();

      set({
        user,
        loading: false,
      });
    } catch (error) {
      console.error(error);

      set({
        user: null,
        loading: false,
      });
    }
  },

  logout: () =>
    set({
      user: null,
      loading: false,
    }),
}));