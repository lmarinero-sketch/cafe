import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Completá todos los campos.');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.error || 'Error al iniciar sesión.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F3] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#D8E4C3]/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F4D58D]/15 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-[#CBD8C8]/20 rounded-full blur-2xl" />

      <div className={`w-full max-w-md relative z-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        {/* Logo & Brand */}
        <div className="text-center mb-8 space-y-3">
          <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-[3px] border-[#2F5233] shadow-lg bg-white">
            <img src="/logo_hilos_de_amor.jpg" alt="Hilos de Amor" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#243627] font-serif">Hilos de Amor</h1>
            <p className="text-xs text-[#5E7B60] font-semibold">Pastelería & Encordado • Panel de Gestión</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-[#CBD8C8] shadow-lg p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-extrabold text-[#243627]">Iniciar Sesión</h2>
            <p className="text-xs text-[#5E7B60]">Ingresá tus credenciales para acceder al panel.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#243627] uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5E7B60]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#CBD8C8] bg-[#F4F7F3] text-sm font-medium text-[#243627] placeholder:text-[#90A88D] focus:outline-none focus:ring-2 focus:ring-[#5E7B60]/30 focus:border-[#5E7B60] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#243627] uppercase tracking-wider">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5E7B60]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-[#CBD8C8] bg-[#F4F7F3] text-sm font-medium text-[#243627] placeholder:text-[#90A88D] focus:outline-none focus:ring-2 focus:ring-[#5E7B60]/30 focus:border-[#5E7B60] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#90A88D] hover:text-[#5E7B60] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs font-bold animate-pulse">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-[#2F5233] text-white font-extrabold text-sm hover:bg-[#1A2E1E] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Ingresando...
                </>
              ) : (
                <>
                  Ingresar <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Grow Labs footer */}
        <div className="text-center mt-6 space-y-2">
          <a
            href="https://www.growlabs.lat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#5E7B60] hover:text-[#243627] transition-colors"
          >
            <span className="w-4 h-4 rounded-full overflow-hidden border border-[#CBD8C8] inline-block shrink-0 bg-white">
              <img src="/logogrow.png" alt="Grow Labs" className="w-full h-full object-cover" />
            </span>
            Plataforma diseñada por <span className="text-emerald-800 font-extrabold">Grow Labs</span> ✨
          </a>
          <p className="text-[10px] text-[#90A88D]">
            © 2026 Grow Labs • Soluciones Gastronómicas Inteligentes
          </p>
        </div>
      </div>
    </div>
  );
};
