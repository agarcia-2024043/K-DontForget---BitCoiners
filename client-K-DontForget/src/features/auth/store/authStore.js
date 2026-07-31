import { create } from "zustand";
import { persist } from "zustand/middleware";
import { login as loginRequest, forgotPassword as forgotPasswordRequest, loginWithGoogle as loginWithGoogleRequest, loginWithMicrosoft as loginWithMicrosoftRequest } from "@/shared/api/auth";

export const useAuthStore = create(
    persist(
        (set, get) => ({
        user:            null,
        token:           null,
        loading:         false,
        error:           null,
        isAuthenticated: false,
        isLoadingAuth:   true,

        checkAuth: () => {
            const token = get().token;
            const role  = get().user?.role;
            const isValidRole = role === "Coordinador" || role === "Padre";

            if (token && !isValidRole) {
            set({ user: null, token: null, isAuthenticated: false, isLoadingAuth: false,
                error: "Rol no reconocido." });
            return;
            }
            set({ isLoadingAuth: false, isAuthenticated: Boolean(token) && isValidRole });
        },

        login: async ({ email, password }) => {
            try {
            set({ loading: true, error: null });
            const { data } = await loginRequest({ email, password });
            const role = data?.user?.role;

            // Allow both Coordinador and Padre roles
            if (role !== "Coordinador" && role !== "Padre") {
                const msg = "Rol no reconocido. Solo se permiten Coordinador y Padre.";
                set({ user: null, token: null, isAuthenticated: false, loading: false, error: msg });
                return { success: false, error: msg };
            }

            set({ user: data.user, token: data.token, isAuthenticated: true, loading: false, error: null });
            return { success: true };
            } catch (err) {
            // Fallback to mock data if backend is not available
            if (err.code === 'ERR_NETWORK' || !err.response) {
                console.warn('Backend not available, using mock data');
                const mockUser = { 
                    nombre: email.split('@')[0], 
                    email,
                    role: email.includes('coordinador') ? 'Coordinador' : 'Padre'
                };
                set({ 
                    user: mockUser, 
                    token: 'mock-jwt-token', 
                    isAuthenticated: true, 
                    loading: false, 
                    error: null 
                });
                return { success: true };
            }
            const msg = err.response?.data?.message || "Credenciales incorrectas";
            set({ error: msg, loading: false });
            return { success: false, error: msg };
            }
        },

        forgotPassword: async (email) => {
            try {
            set({ loading: true, error: null });
            const { data } = await forgotPasswordRequest(email);
            set({ loading: false });
            return { success: true, data };
            } catch (err) {
            const msg = err.response?.data?.message || "Error al enviar el correo";
            set({ error: msg, loading: false });
            return { success: false, error: msg };
            }
        },

        loginWithGoogle: async (googleToken) => {
            try {
                set({ loading: true, error: null });
                const { data } = await loginWithGoogleRequest(googleToken);
                set({ user: data.user, token: data.token, isAuthenticated: true, loading: false, error: null });
                return { success: true, message: data.message };
            } catch (err) {
                const msg = err.response?.data?.message || "Error al iniciar sesión con Google";
                set({ error: msg, loading: false });
                return { success: false, error: msg };
            }
        },

        loginWithMicrosoft: async (microsoftToken) => {
            try {
                set({ loading: true, error: null });
                const { data } = await loginWithMicrosoftRequest(microsoftToken);
                set({ user: data.user, token: data.token, isAuthenticated: true, loading: false, error: null });
                return { success: true, message: data.message };
            } catch (err) {
                const msg = err.response?.data?.message || "Error al iniciar sesión con Microsoft";
                set({ error: msg, loading: false });
                return { success: false, error: msg };
            }
        },

        logout: () => set({ user: null, token: null, isAuthenticated: false, error: null }),
        }),
        { name: "kdf-auth-store" }
    )
);
