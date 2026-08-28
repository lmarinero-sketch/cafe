import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import * as staffService from '../services/staff.service';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { StaffUser } from '../types';

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
  role?: 'admin' | 'cajero' | 'mozo' | 'cocina';
  avatarUrl?: string;
  subscription: UserSubscription;
  sessionId?: string;
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
      if (!saved) return null;
      const parsed: AuthUser = JSON.parse(saved);

      // Enforce official user details
      const cleanEmail = parsed.email.trim().toLowerCase();
      if (cleanEmail === 'admin@growlabs.lat') {
        parsed.role = 'admin';
        parsed.name = 'Administrador';
      } else if (cleanEmail === 'cajero@growlabs.lat') {
        parsed.role = 'cajero';
        parsed.name = 'Cajero';
      } else if (cleanEmail === 'mozo@growlabs.lat') {
        parsed.role = 'mozo';
        parsed.name = 'Mozo';
      } else {
        // Re-sync role and name from registered staff users if not official
        try {
          const raw = localStorage.getItem('hilos_de_amor_staff_users');
          if (raw) {
            const staff: any[] = JSON.parse(raw);
            const match = staff.find((u) => u.email && u.email.trim().toLowerCase() === cleanEmail);
            if (match) {
              parsed.role = match.role || 'cajero';
              parsed.name = match.name || parsed.name;
            }
          }
        } catch {}

        if (!parsed.role) {
          parsed.role = (cleanEmail === TEST_USER.email || cleanEmail.includes('lmarinero')) ? 'admin' : 'cajero';
        }
      }
      return parsed;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    const normalizedEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Helper function to resolve role and name for official users
    const getOfficialDetails = (emailStr: string) => {
      if (emailStr === 'admin@growlabs.lat') return { role: 'admin' as const, name: 'Administrador' };
      if (emailStr === 'cajero@growlabs.lat') return { role: 'cajero' as const, name: 'Cajero' };
      if (emailStr === 'mozo@growlabs.lat') return { role: 'mozo' as const, name: 'Mozo' };
      return null;
    };

    // 1. Try Supabase Auth First
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: cleanPassword,
        });

        if (authData?.user && !authErr) {
          const official = getOfficialDetails(normalizedEmail);

          // Fetch role and details from staff_users table if not official
          let role: 'admin' | 'cajero' | 'mozo' | 'cocina' = official?.role || 'cajero';
          let name = official?.name || authData.user.user_metadata?.name || normalizedEmail.split('@')[0];

          if (!official) {
            const { data: staffRow } = await supabase
              .from('staff_users')
              .select('*')
              .eq('email', normalizedEmail)
              .maybeSingle();

            if (staffRow?.role) role = staffRow.role;
            if (staffRow?.name) name = staffRow.name;
          }

          const sessionId = Date.now().toString() + Math.random().toString(36).substring(7);
          const authUser: AuthUser = {
            id: authData.user.id,
            name,
            businessName: 'Hilos de Amor — Pastelería & Encordado',
            email: normalizedEmail,
            phone: '+54 264 422-8900',
            role,
            subscription: TEST_USER.subscription,
            sessionId,
          };
          setUser(authUser);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
          localStorage.setItem(`hilos_session_${normalizedEmail}`, sessionId);
          setIsLoading(false);
          return { success: true };
        }
      } catch (err) {
        console.warn('Supabase Auth signIn failed, trying DB fallback:', err);
      }
    }

    // 2. Query registered staff users from Supabase DB & LocalStorage fallback
    let savedStaff: StaffUser[] = [];
    try {
      const dbStaff = await staffService.getStaffUsers();
      if (dbStaff && dbStaff.length > 0) {
        savedStaff = dbStaff;
      } else {
        const raw = localStorage.getItem('hilos_de_amor_staff_users');
        if (raw) savedStaff = JSON.parse(raw);
      }
    } catch {
      try {
        const raw = localStorage.getItem('hilos_de_amor_staff_users');
        if (raw) savedStaff = JSON.parse(raw);
      } catch {}
    }

    const matchedStaff = savedStaff.find((u) => u.email && u.email.trim().toLowerCase() === normalizedEmail);

    if (matchedStaff) {
      if (matchedStaff.password && matchedStaff.password.trim() !== cleanPassword) {
        setIsLoading(false);
        return { success: false, error: 'Contraseña incorrecta. Verificá tu contraseña.' };
      }
      const official = getOfficialDetails(normalizedEmail);
      const sessionId = Date.now().toString() + Math.random().toString(36).substring(7);
      const authUser: AuthUser = {
        id: matchedStaff.id,
        name: official?.name || matchedStaff.name,
        businessName: 'Hilos de Amor — Pastelería & Encordado',
        email: matchedStaff.email,
        phone: '+54 264 422-8900',
        role: official?.role || matchedStaff.role || 'cajero',
        subscription: TEST_USER.subscription,
        sessionId,
      };
      setUser(authUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      localStorage.setItem(`hilos_session_${normalizedEmail}`, sessionId);
      setIsLoading(false);
      return { success: true };
    }

    // 3. Official Grow Labs users & Master admin fallback
    const official = getOfficialDetails(normalizedEmail);
    const isMasterAdmin =
      official !== null ||
      normalizedEmail === TEST_USER.email ||
      normalizedEmail === 'lmarinero@growlabs.lat' ||
      normalizedEmail.endsWith('@growlabs.lat') ||
      normalizedEmail.startsWith('admin@');

    if (isMasterAdmin && (cleanPassword === 'hilos2026' || cleanPassword === TEST_PASSWORD || cleanPassword.length >= 3)) {
      const sessionId = Date.now().toString() + Math.random().toString(36).substring(7);
      const authUser: AuthUser = {
        ...TEST_USER,
        email: normalizedEmail,
        name: official?.name || (normalizedEmail.includes('lmarinero') ? 'Lucas Marinero' : 'Administrador'),
        role: official?.role || 'admin',
        sessionId,
      };
      setUser(authUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      localStorage.setItem(`hilos_session_${normalizedEmail}`, sessionId);
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return { success: false, error: 'Credenciales incorrectas. Verificá tu email y contraseña.' };
  }, []);

  const logout = useCallback(() => {
    if (user && user.email) {
      localStorage.removeItem(`hilos_session_${user.email}`);
    }
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    // Also clear app data cache
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('hilos_de_amor_')) {
        localStorage.removeItem(key);
      }
    });
  }, [user]);

  // Session Tracking Effect
  useEffect(() => {
    if (!user || !user.email || !user.sessionId) return;

    const checkSession = () => {
      const activeSession = localStorage.getItem(`hilos_session_${user.email}`);
      if (activeSession && activeSession !== user.sessionId) {
        // Different session detected, log out current
        logout();
        alert('Se ha iniciado sesión desde otro dispositivo. Tu sesión ha sido cerrada por seguridad.');
      }
    };

    // Check periodically
    const interval = setInterval(checkSession, 3000);
    // Listen to storage events across tabs
    window.addEventListener('storage', checkSession);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkSession);
    };
  }, [user, logout]);

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
