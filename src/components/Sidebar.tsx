import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  CalendarDays,
  BookOpen,
  TrendingUp,
  FileText,
  Bell,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Pin,
  Sprout,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import { useEdu } from '../context/EduContext';
import { ViewType } from '../types';
import { FoliumLogo } from './FoliumLogo';

export interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tarefas Acadêmicas', icon: CheckSquare },
  { id: 'schedule', label: 'Agenda Diária', icon: Calendar },
  { id: 'calendar', label: 'Horários e Calendário', icon: CalendarDays },
  { id: 'campus-map', label: 'Mapa do Campus (3D)', icon: MapPin },
  { id: 'disciplines', label: 'Disciplinas', icon: BookOpen },
  { id: 'progress', label: 'Progresso Acadêmico', icon: TrendingUp },
  { id: 'materials', label: 'Materiais de Estudo', icon: FileText },
  { id: 'notices', label: 'Notificações e Avisos', icon: Bell },
  { id: 'profile', label: 'Meu Perfil', icon: User },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, tasks, unreadNotificationCount } = useEdu();

  // Estado manual de fixação da barra (persistido localmente)
  const [isPinned, setIsPinned] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('folium_sidebar_pinned_v1');
      return stored ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  // Estado de expansão temporária ao passar o mouse
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sincroniza fixação manual
  useEffect(() => {
    try {
      localStorage.setItem('folium_sidebar_pinned_v1', JSON.stringify(isPinned));
    } catch {
      // Ignora erro
    }
  }, [isPinned]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (!isPinned) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isPinned) {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHovered(false);
      }, 120);
    }
  };

  const togglePin = () => {
    setIsPinned((prev) => {
      const next = !prev;
      if (next) setIsHovered(false);
      return next;
    });
  };

  const isExpanded = isPinned || isHovered;
  const pendingCount = tasks.filter((t) => !t.completed).length;

  return (
    <aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`hidden md:flex flex-col bg-[#203A65] text-white transition-all duration-200 ease-in-out z-20 relative select-none border-r border-[#1B3156] shrink-0 h-screen ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
      aria-label="Navegação Principal Folium"
    >
      {/* Detalhe estético: curvas de folhas translúcidas no fundo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
        <svg
          className="absolute -bottom-10 -left-10 w-64 h-64 text-white"
          viewBox="0 0 200 200"
          fill="currentColor"
        >
          <path d="M40,180 C80,140 120,120 180,100 C150,150 110,180 40,180 Z" opacity="0.4" />
          <path d="M10,200 C60,150 110,130 190,110 C140,170 90,200 10,200 Z" opacity="0.3" />
        </svg>
      </div>

      {/* Topo / Marca Oficial Folium */}
      <div className="h-20 flex items-center px-4 justify-between overflow-hidden shrink-0 relative z-10">
        {isExpanded ? (
          <FoliumLogo variant="dark" size="md" showSlogan={true} />
        ) : (
          <div className="w-full flex justify-center">
            <FoliumLogo variant="dark" size="md" symbolOnly={true} />
          </div>
        )}
      </div>

      {/* Lista com os 10 Itens de Navegação Oficiais */}
      <nav className="flex-1 py-2 px-3 space-y-1 overflow-y-auto overflow-x-hidden relative z-10" role="navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-white/50 text-left cursor-pointer overflow-hidden group relative ${
                isActive
                  ? 'bg-white/15 text-white shadow-xs font-semibold backdrop-blur-xs border border-white/10'
                  : 'text-white/75 hover:bg-white/10 hover:text-white'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              title={!isExpanded ? item.label : undefined}
            >
              <div className="flex items-center min-w-0">
                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-white/75 group-hover:text-white'
                  }`}
                />
                <span
                  className={`whitespace-nowrap transition-all duration-200 truncate ${
                    isExpanded
                      ? 'opacity-100 max-w-[145px] ml-3.5'
                      : 'opacity-0 max-w-0 ml-0 pointer-events-none'
                  }`}
                >
                  {item.label}
                </span>
              </div>

              {/* Badges de Contagem (exatamente como na referência) */}
              {isExpanded && item.id === 'tasks' && pendingCount > 0 && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono tabular-nums shrink-0 ml-1.5 font-bold ${
                    isActive
                      ? 'bg-white text-[#203A65]'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {pendingCount}
                </span>
              )}

              {isExpanded && item.id === 'notices' && unreadNotificationCount > 0 && (
                <span className="text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-mono tabular-nums shrink-0 ml-1.5 font-bold bg-[#E63946] text-white ring-1 ring-white/20">
                  {unreadNotificationCount}
                </span>
              )}

              {/* Ponto indicador discreto quando recolhido */}
              {!isExpanded && item.id === 'notices' && unreadNotificationCount > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#E63946] absolute right-2.5 top-2.5 ring-2 ring-[#203A65]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Card Motivacional Inferior: "Grandes conquistas começam com organização." */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 shrink-0 relative z-10">
          <button
            onClick={() => setActiveView('schedule')}
            className="w-full text-left bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 border border-white/15 rounded-2xl p-3.5 backdrop-blur-xs transition-all cursor-pointer group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
                  <Sprout className="w-4 h-4 text-emerald-300" />
                </div>
                <p className="text-[11px] text-white/90 font-medium leading-snug">
                  Grandes conquistas começam com organização.
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-white/60 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </div>
          </button>
        </div>
      )}

      {/* Rodapé da Sidebar: Fixar / Recolher Manual */}
      <div className="p-3 border-t border-white/10 space-y-1.5 overflow-hidden shrink-0 relative z-10">
        <button
          onClick={togglePin}
          className={`w-full flex items-center justify-center py-2 rounded-xl transition-colors text-xs font-medium cursor-pointer ${
            isPinned
              ? 'bg-white/10 text-white hover:bg-white/15'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          aria-label={isPinned ? 'Desafixar barra lateral (recolhimento automático)' : 'Fixar barra lateral expandida'}
          title={isPinned ? 'Clique para desafixar (recolhe automaticamente)' : 'Clique para fixar aberta'}
        >
          {isPinned ? (
            <div className="flex items-center space-x-2 truncate px-1">
              <ChevronLeft className="w-4 h-4 shrink-0" />
              {isExpanded && <span className="truncate">Barra Fixada</span>}
            </div>
          ) : (
            <div className="flex items-center space-x-2 truncate px-1">
              {isExpanded ? (
                <>
                  <Pin className="w-4 h-4 shrink-0 text-white/80" />
                  <span className="truncate">Fixar Aberta</span>
                </>
              ) : (
                <ChevronRight className="w-4 h-4 shrink-0 text-white/80" />
              )}
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
