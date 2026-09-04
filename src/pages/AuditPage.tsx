import React, { useState } from 'react';
import { 
  Activity, 
  Users, 
  Monitor, 
  Clock, 
  Search, 
  Filter,
  Medal,
  MousePointerClick,
  ChevronRight,
  ShieldCheck,
  RefreshCcw
} from 'lucide-react';
import { AuditLogEntry, UserActivityStats, ModuleUsage } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useApp } from '../context/AppContext';

export const AuditPage: React.FC = () => {
  const { auditLogs } = useApp();
  const [activeTab, setActiveTab] = useState<'resumen' | 'log'>('resumen');
  const [searchTerm, setSearchTerm] = useState('');

  // Cálculos Dinámicos
  const onlineNow = new Set(auditLogs.filter(log => new Date(log.timestamp).getTime() > Date.now() - 1000 * 60 * 15).map(log => log.userId)).size;
  const activeUsers = new Set(auditLogs.filter(log => new Date(log.timestamp).getTime() > Date.now() - 1000 * 60 * 60 * 24).map(log => log.userId)).size;
  const totalClicksLast24h = auditLogs.filter(log => log.action === 'Clic' && new Date(log.timestamp).getTime() > Date.now() - 1000 * 60 * 60 * 24).length;
  const totalSessions = activeUsers; // Aproximación básica
  const totalHoursStr = `${Math.floor(totalClicksLast24h / 10)}h 15m`; // Mock hasta tener un tracking de tiempo real

  const DYNAMIC_STATS = {
    onlineNow,
    activeUsers,
    totalSessions,
    totalHours: totalHoursStr
  };

  const calculateUserActivity = (): UserActivityStats[] => {
    const userMap = new Map<string, any>();
    auditLogs.forEach(log => {
      if (!userMap.has(log.userId)) {
        userMap.set(log.userId, { userId: log.userId, userName: log.userName, clicks: 0, lastActive: 0 });
      }
      const data = userMap.get(log.userId);
      data.clicks++;
      const time = new Date(log.timestamp).getTime();
      if (time > data.lastActive) data.lastActive = time;
    });

    return Array.from(userMap.values())
      .sort((a, b) => b.clicks - a.clicks)
      .map(data => {
        const timeDiff = Math.round((Date.now() - data.lastActive) / 60000);
        const lastActiveStr = timeDiff < 60 ? `hace ${timeDiff} min` : `hace ${Math.round(timeDiff / 60)}h`;
        return {
          userId: data.userId,
          userName: data.userName,
          totalSessions: Math.max(1, Math.floor(data.clicks / 10)),
          totalHours: `${Math.max(1, Math.floor(data.clicks / 5))}h 00m`,
          lastActive: lastActiveStr,
          clicksLast24h: data.clicks,
          hoursLast24h: `${Math.max(1, Math.floor(data.clicks / 10))}h 30m`
        };
      });
  };

  const calculateModuleUsage = (): ModuleUsage[] => {
    const moduleMap = new Map<string, Set<string>>();
    const moduleClicks = new Map<string, number>();

    auditLogs.forEach(log => {
      if (!moduleMap.has(log.module)) {
        moduleMap.set(log.module, new Set());
        moduleClicks.set(log.module, 0);
      }
      moduleMap.get(log.module)!.add(log.userId);
      moduleClicks.set(log.module, moduleClicks.get(log.module)! + 1);
    });

    return Array.from(moduleClicks.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([moduleName, clicks]) => ({
        moduleName,
        hours: `${Math.floor(clicks / 5)}h`,
        minutes: `${clicks % 60}m`,
        userCount: moduleMap.get(moduleName)!.size
      }));
  };

  const DYNAMIC_USER_ACTIVITY = calculateUserActivity();
  const DYNAMIC_MODULE_USAGE = calculateModuleUsage();

  const filteredLogs = auditLogs.filter(log => 
    log.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-dark font-serif tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-brand-brown" />
            Auditoría y Actividad
          </h1>
          <p className="text-sm text-brand-brown/80 font-medium">Monitoreo de sesiones, uso del sistema y trazabilidad de acciones.</p>
        </div>
        
        <div className="flex gap-2 bg-brand-secondary/30 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('resumen')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'resumen' ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-dark/60 hover:text-brand-dark'
            }`}
          >
            Resumen Global
          </button>
          <button
            onClick={() => setActiveTab('log')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'log' ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-dark/60 hover:text-brand-dark'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Log de Auditoría ECAR
          </button>
        </div>
      </div>

      {activeTab === 'resumen' ? (
        <div className="space-y-6">
          {/* Title & Filters */}
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-soft border border-brand-secondary/40">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-brown rounded-xl shadow-inner">
                <Activity className="w-5 h-5 text-brand-card" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-brand-dark leading-tight">Actividad de Usuarios</h2>
                <p className="text-xs text-brand-brown/70">Sesiones, horas y módulos más usados</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="text-xs font-bold text-brand-dark/60 px-3 py-1.5 hover:bg-brand-secondary/30 rounded-lg cursor-pointer">Hoy</span>
              <span className="text-xs font-bold text-brand-dark/60 px-3 py-1.5 hover:bg-brand-secondary/30 rounded-lg cursor-pointer">Semana</span>
              <span className="text-xs font-bold text-brand-brown bg-brand-yellow/30 px-3 py-1.5 rounded-lg cursor-pointer">30 días</span>
              <span className="text-xs font-bold text-brand-dark/60 px-3 py-1.5 hover:bg-brand-secondary/30 rounded-lg cursor-pointer">90 días</span>
              <button className="p-1.5 rounded-lg border border-brand-secondary/50 text-brand-dark/60 hover:bg-brand-secondary/30">
                <RefreshCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-soft border border-brand-secondary/40 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100/50 text-emerald-600 flex items-center justify-center relative">
                <Activity className="w-6 h-6" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-brand-dark">{DYNAMIC_STATS.onlineNow}</p>
                <p className="text-xs text-brand-dark/60 font-bold uppercase tracking-wide">Online Ahora</p>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-2xl shadow-soft border border-brand-secondary/40 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-yellow/30 text-brand-brown flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-brand-dark">{DYNAMIC_STATS.activeUsers}</p>
                <p className="text-xs text-brand-dark/60 font-bold uppercase tracking-wide">Usuarios Activos</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-soft border border-brand-secondary/40 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-green/30 text-emerald-800 flex items-center justify-center">
                <Monitor className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-brand-dark">{DYNAMIC_STATS.totalSessions}</p>
                <p className="text-xs text-brand-dark/60 font-bold uppercase tracking-wide">Sesiones Totales</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-soft border border-brand-secondary/40 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100/50 text-rose-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-brand-dark">{DYNAMIC_STATS.totalHours}</p>
                <p className="text-xs text-brand-dark/60 font-bold uppercase tracking-wide">Horas Totales</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ranking por Horas */}
            <div className="bg-white rounded-2xl shadow-soft border border-brand-secondary/40 p-6 flex flex-col h-full">
              <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2 mb-6">
                <Activity className="w-4 h-4 text-brand-brown" /> Ranking por Horas
              </h3>
              
              <div className="space-y-1 flex-1">
                {DYNAMIC_USER_ACTIVITY.length > 0 ? DYNAMIC_USER_ACTIVITY.map((user, idx) => (
                  <div key={user.userId} className="flex items-center justify-between p-3 rounded-xl hover:bg-brand-secondary/20 transition-colors border-b border-brand-secondary/30 last:border-0 group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-6">
                        {idx < 3 ? (
                          <Medal className={`w-5 h-5 ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : 'text-amber-700'}`} />
                        ) : (
                          <span className="text-xs font-bold text-brand-dark/40">#{idx + 1}</span>
                        )}
                      </div>
                      <div className="w-9 h-9 rounded-full bg-brand-brown text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {user.userName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-brand-dark">{user.userName}</p>
                        <p className="text-[11px] text-brand-brown/70">{user.totalSessions} sesiones • Último: {user.lastActive}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-brand-brown">{user.totalHours}</span>
                      <ChevronRight className="w-4 h-4 text-brand-dark/30 group-hover:text-brand-brown transition-colors" />
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-brand-dark/50 text-center py-4">No hay datos de actividad para mostrar.</p>
                )}
              </div>
            </div>

            {/* Módulos Más Usados */}
            <div className="bg-white rounded-2xl shadow-soft border border-brand-secondary/40 p-6 flex flex-col h-full">
              <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2 mb-6">
                <Monitor className="w-4 h-4 text-amber-500" /> Módulos Más Usados
              </h3>
              
              <div className="space-y-5 flex-1">
                {DYNAMIC_MODULE_USAGE.length > 0 ? DYNAMIC_MODULE_USAGE.map((mod, idx) => {
                  const maxHours = parseInt(DYNAMIC_MODULE_USAGE[0].hours) || 1;
                  const currentHours = parseInt(mod.hours) || 0;
                  const percentage = Math.max(10, Math.round((currentHours / maxHours) * 100));
                  
                  return (
                    <div key={idx} className="flex items-center gap-4 text-xs">
                      <div className="w-32 truncate font-bold text-brand-dark shrink-0">
                        {mod.moduleName}
                      </div>
                      <div className="flex-1 h-6 bg-brand-secondary/30 rounded-r-md rounded-l-sm relative flex items-center group">
                        <div 
                          className={`h-full rounded-r-md rounded-l-sm transition-all duration-1000 flex items-center px-2 ${idx === 0 ? 'bg-amber-400' : idx === 1 ? 'bg-brand-brown/80' : 'bg-brand-secondary/80'}`}
                          style={{ width: `${percentage}%` }}
                        >
                          <span className={`text-[10px] font-extrabold ${idx === 0 || idx === 1 ? 'text-white' : 'text-brand-dark'}`}>
                            {mod.hours} {mod.minutes}
                          </span>
                        </div>
                      </div>
                      <div className="w-16 text-right text-brand-dark/50 shrink-0">
                        {mod.userCount} users
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-sm text-brand-dark/50 text-center py-4">No hay datos de uso por módulo.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Resumen 24hs Cards */}
          <div className="bg-white rounded-2xl p-5 shadow-soft border border-brand-secondary/40">
            <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-brand-brown" /> Resumen de Actividad (Últimas 24hs)
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-2">
              {DYNAMIC_USER_ACTIVITY.slice(0, 4).map(user => (
                <div key={user.userId} className="border border-brand-secondary/50 rounded-xl p-4 bg-brand-bg/50">
                  <p className="font-bold text-brand-dark text-sm mb-3 truncate">{user.userName.toLowerCase().replace(' ', '')}</p>
                  <div className="flex gap-4 text-xs font-semibold text-brand-dark/80 mb-3">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-brand-brown" /> {user.hoursLast24h}</span>
                    <span className="flex items-center gap-1 text-emerald-700"><MousePointerClick className="w-3.5 h-3.5" /> {user.clicksLast24h} clics</span>
                  </div>
                  <p className="text-[10px] text-brand-dark/40 italic">Módulos principales (calculando...)</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabla de Log */}
          <div className="bg-white rounded-2xl shadow-soft border border-brand-secondary/40 overflow-hidden">
            <div className="p-4 border-b border-brand-secondary/40 flex flex-col sm:flex-row justify-between items-center gap-4 bg-brand-card">
              <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-brown" /> Log de Auditoría
              </h3>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark/40" />
                  <input
                    type="text"
                    placeholder="Buscar usuario o módulo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-brand-secondary/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-brown/20 transition-all shadow-inner"
                  />
                </div>
                <button className="flex items-center gap-2 px-3 py-2 bg-white border border-brand-secondary/60 rounded-xl text-sm font-medium hover:bg-brand-secondary/20 transition-colors shrink-0">
                  <Filter className="w-4 h-4" /> Todo el tiempo
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-brand-secondary/20 border-b border-brand-secondary/50 text-[10px] uppercase tracking-wider text-brand-dark/60">
                    <th className="p-4 font-bold">FECHA / HORA</th>
                    <th className="p-4 font-bold">USUARIO</th>
                    <th className="p-4 font-bold">MÓDULO</th>
                    <th className="p-4 font-bold text-center">ACCIÓN</th>
                    <th className="p-4 font-bold">DETALLE</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredLogs.map(log => {
                    const actionColors = {
                      'login': 'bg-blue-100 text-blue-700 border-blue-200',
                      'logout': 'bg-slate-100 text-slate-700 border-slate-200',
                      'Clic': 'bg-emerald-100 text-emerald-700 border-emerald-200',
                      'Crear': 'bg-brand-yellow text-brand-brown border-amber-200',
                      'Actualizar': 'bg-purple-100 text-purple-700 border-purple-200',
                      'Eliminar': 'bg-rose-100 text-rose-700 border-rose-200',
                      'Visualizar': 'bg-brand-secondary text-brand-dark border-brand-secondary/50',
                    };
                    const colorClass = actionColors[log.action as keyof typeof actionColors] || 'bg-gray-100 text-gray-700 border-gray-200';

                    return (
                      <tr key={log.id} className="border-b border-brand-secondary/30 hover:bg-brand-secondary/10 transition-colors">
                        <td className="p-4 text-brand-dark/70 whitespace-nowrap">
                          {format(new Date(log.timestamp), "dd/MM/yyyy, hh:mm:ss a", { locale: es })}
                        </td>
                        <td className="p-4 font-bold text-brand-dark whitespace-nowrap">
                          {log.userName.toLowerCase().replace(' ', '')}
                        </td>
                        <td className="p-4 text-brand-dark/80 whitespace-nowrap">
                          {log.module}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-wide border ${colorClass}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="p-4 text-brand-dark/70 font-mono text-xs truncate max-w-xs sm:max-w-md">
                          {log.details}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-brand-dark/50 italic">
                        No se encontraron registros de auditoría.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
