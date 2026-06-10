import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL;

interface User { id: string; email: string; role: string; }

interface AuthStore {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    _hasHydrated: boolean,
    setHasHydrated: (val: boolean) => void
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            loading: false,
            _hasHydrated: false,

            setHasHydrated: (val) => set({ _hasHydrated: val }),

            login: async (email, password) => {
                set({ loading: true });
                try {
                    const { data } = await axios.post(`${API}/auth/login`, { email, password });
                    const { access_token } = data.data;
                    const payload = JSON.parse(atob(access_token.split('.')[1]));
                    const user = { id: payload.sub, email: payload.email, role: payload.role };
                    set({ user, token: access_token, loading: false });
                } catch (err) {
                    set({ loading: false });
                    throw err;
                }
            },

            logout: () => {
                set({ user: null, token: null });
            },
        }),
        {
            name: 'np_auth', // persists to localStorage automatically
            partialize: (state) => ({ user: state.user, token: state.token }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);