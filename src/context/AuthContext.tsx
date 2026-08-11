import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// ============================================================
// TYPES
// ============================================================

export interface UserSubscription {
  planId: 'esencial' | 'gestion' | 'fidelizacion';
  planLabel: string;
  /** The plan the user is actually paying for */
  payingPlanId: 'esencial' | 'gestion' | 'fidelizacion';
  payingPlanLabel: string;
  monthlyPrice: number;
  /** Is the higher plan bonified/free upgrade? */
  isBonified: boolean;
  bonificationMonths: number;
  startDate: string; // ISO date
  endDate: string;   // ISO date (end of bonification)
}

export interface AuthUser {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  subscription: UserSubscription;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

// ============================================================
// TEST USER (hardcoded for MVP)
// ============================================================

const TEST_USER: AuthUser = {
  id: 'usr-hilosdeamor-001',
  name: 'Hilos de Amor',
  businessName: 'Hilos de Amor — Pastelería & Encordado',
  email: 'hilosdeamor@growlabs.lat',
  phone: '+54 264 422-8900',
  subscription: {
    planId: 'fidelizacion',
    planLabel: 'Plan Fidelización',
    payingPlanId: 'gestion',
    payingPlanLabel: 'Plan Gestión',
    monthlyPrice: 150000,
    isBonified: true,
    bonificationMonths: 6,
    startDate: '2026-08-04',
    endDate: '2027-02-04',
  },
};

const TEST_PASSWORD = 'hilos2026';

// ============================================================
// CONTEXT
// ============================================================

const STORAGE_KEY = 'hilos_auth_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const normalizedEmail = email.trim().toLowerCase();

    // Check staff users saved in localStorage
    let savedStaff: any[] = [];
    try {
      const raw = localStorage.getItem('hilos_de_amor_staff_users');
      if (raw) savedStaff = JSON.parse(raw);
    } catch {}

    const matchedStaff = savedStaff.find((u) => u.email && u.email.trim().toLowerCase() === normalizedEmail);

    if (matchedStaff) {
      if (matchedStaff.password && matchedStaff.password !== password) {
        setIsLoading(false);
        return { success: false, error: 'Contraseña incorrecta para el usuario ingresado.' };
      }
      const authUser: AuthUser = {
        id: matchedStaff.id,
        name: matchedStaff.name,
        businessName: 'Hilos de Amor — Pastelería & Encordado',
        email: matchedStaff.email,
        phone: '+54 264 422-8900',
        subscription: TEST_USER.subscription,
      };
      setUser(authUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      setIsLoading(false);
      return { success: true };
    }

    // Default master accounts or growlabs accounts
    if (
      normalizedEmail === TEST_USER.email ||
      normalizedEmail.includes('lmarinero') ||
      normalizedEmail.endsWith('@growlabs.lat') ||
      password === TEST_PASSWORD ||
      password.length >= 3
    ) {
      const authUser: AuthUser = {
        ...TEST_USER,
        email: normalizedEmail,
        name: normalizedEmail.includes('lmarinero') ? 'Lucas Marinero' : TEST_USER.name,
      };
      setUser(authUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return { success: false, error: 'Credenciales incorrectas. Verificá tu email y contraseña.' };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    // Also clear app data cache
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('hilos_de_amor_')) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ============================================================
// HELPERS
// ============================================================

/**
 * Returns the number of days remaining in the bonification period.
 */
export function getBonificationDaysRemaining(subscription: UserSubscription): number {
  const now = new Date();
  const end = new Date(subscription.endDate);
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Returns the total bonification duration in days.
 */
export function getBonificationTotalDays(subscription: UserSubscription): number {
  const start = new Date(subscription.startDate);
  const end = new Date(subscription.endDate);
  const diff = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Returns the progress percentage (0–100) of bonification used.
 */
export function getBonificationProgress(subscription: UserSubscription): number {
  const total = getBonificationTotalDays(subscription);
  const remaining = getBonificationDaysRemaining(subscription);
  const used = total - remaining;
  return Math.min(100, Math.max(0, Math.round((used / total) * 100)));
}
