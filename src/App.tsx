import React, { useState } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  CalendarDays,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { EduProvider, useEdu } from './context/EduContext';
import { Sidebar, NAV_ITEMS } from './components/Sidebar';
import { Header } from './components/Header';
import { TaskDetailModal } from './components/TaskDetailModal';
import { CopilotModal } from './components/CopilotModal';
import { FoliumLogo } from './components/FoliumLogo';
import { CampusMapModal } from './components/CampusMapModal';

import { DashboardView } from './views/DashboardView';
import { TasksView } from './views/TasksView';
import { ScheduleView } from './views/ScheduleView';
import { CalendarView } from './views/CalendarView';
import { DisciplinesView } from './views/DisciplinesView';
import { ProgressView } from './views/ProgressView';
import { MaterialsView } from './views/MaterialsView';
import { NoticesView } from './views/NoticesView';
import { ProfileView } from './views/ProfileView';
import { SettingsView } from './views/SettingsView';
import { CampusMapView } from './views/CampusMapView';

import { Task, ViewType } from './types';

interface BottomNavItem {
  id: ViewType | 'more';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MOBILE_BOTTOM_NAV: BottomNavItem[] = [
  { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
  { id: 'schedule', label: 'Agenda', icon: Calendar },
  { id: 'calendar', label: 'Horários', icon: CalendarDays },
  { id: 'more', label: 'Menu', icon: Menu },
];

const MainContent: React.FC = () => {
  const {
    activeView,
    setActiveView,
    isCopilotOpen,
    setIsCopilotOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    tasks,
    unreadNotificationCount,
    isMapModalOpen,
    setIsMapModalOpen,
    targetRoomForMap,
  } = useEdu();

  // Modal de Detalhes da Tarefa Acadêmica
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);

  const getHeaderInfo = (): { title: string; subtitle: string } => {
    switch (activeView) {
      case 'dashboard':
        return {
          title: 'Dashboard Folium',
          subtitle: 'Visão unificada das suas pendências, entregas e compromissos do dia.',
        };
      case 'tasks':
        return {
          title: 'Tarefas Acadêmicas',
          subtitle: 'Consulte prazos, orientações e formato de entrega disponibilizados pela gestão.',
        };
      case 'schedule':
        return {
          title: 'Agenda Diária de Estudos',
          subtitle: 'Planeje horários dedicados e evite sobreposição de compromissos.',
        };
      case 'calendar':
        return {
          title: 'Horários e Calendário',
          subtitle: 'Visualização de aulas, entregas e grade horária semanal e mensal.',
        };
      case 'disciplines':
        return {
          title: 'Disciplinas Curriculares',
          subtitle: 'Carga horária, salas, tarefas vinculadas e materiais de apoio por matéria.',
        };
      case 'progress':
        return {
          title: 'Progresso Acadêmico',
          subtitle: 'Monitore o cumprimento da meta semanal e distribuição de esforço.',
        };
      case 'materials':
        return {
          title: 'Materiais de Estudo',
          subtitle: 'Apostilas, slides, leituras e links de apoio recomendados pelos docentes.',
        };
      case 'notices':
        return {
          title: 'Notificações e Avisos',
          subtitle: 'Comunicados oficiais da coordenação e lembretes de prazos.',
        };
      case 'profile':
        return {
          title: 'Meu Perfil Acadêmico',
          subtitle: 'Identificação discente, matrícula, curso e dados acadêmicos.',
        };
      case 'settings':
        return {
          title: 'Configurações',
          subtitle: 'Ajuste sua meta semanal, janela de alertas e preferências gerais.',
        };
      case 'campus-map':
        return {
          title: 'Mapa 3D do Campus e Localização',
          subtitle: 'Navegação interativa, rotas de acesso e distribuição das instalações acadêmicas.',
        };
      default:
        return {
          title: 'Folium',
          subtitle: 'Conhecimento em cada etapa',
        };
    }
  };

  const { title, subtitle } = getHeaderInfo();
  const pendingCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="flex h-screen bg-[#F6F7F9] dark:bg-[#0B132B] font-sans text-slate-900 dark:text-slate-100 antialiased overflow-hidden transition-colors duration-250">
      {/* Sidebar Desktop */}
      <Sidebar />

      {/* Drawer Mobile Completo (Todas as 10 seções acadêmicas) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex md:hidden bg-slate-900/40 backdrop-blur-xs transition-opacity"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-72 bg-[#203A65] text-white h-full flex flex-col justify-between shadow-2xl">
            {/* Topo do Drawer */}
            <div className="p-5 pb-3">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <FoliumLogo variant="dark" size="sm" showSlogan={true} />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
                  aria-label="Fechar menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Lista com todas as 10 seções */}
            <nav className="flex-1 overflow-y-auto px-5 py-2 space-y-1" role="navigation">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                const isTask = item.id === 'tasks';
                const isNotice = item.id === 'notices';

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-[#203A65] shadow-xs'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {isTask && pendingCount > 0 && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-mono tabular-nums ${
                          isActive
                            ? 'bg-[#EAF0F7] text-[#203A65]'
                            : 'bg-white/15 text-white'
                        }`}
                      >
                        {pendingCount}
                      </span>
                    )}

                    {isNotice && unreadNotificationCount > 0 && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-mono tabular-nums ${
                          isActive
                            ? 'bg-red-100 text-red-700'
                            : 'bg-red-500 text-white'
                        }`}
                      >
                        {unreadNotificationCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Rodapé do Drawer */}
            <div className="p-4 border-t border-white/10 text-[11px] text-white/60 text-center">
              Folium • Conhecimento em cada etapa
            </div>
          </div>

          <div
            className="flex-1"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Fechar fundo do menu"
          />
        </div>
      )}

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title={title} subtitle={subtitle} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          {activeView === 'dashboard' && (
            <DashboardView onOpenTaskDetail={(task) => setSelectedTaskForDetail(task)} />
          )}
          {activeView === 'tasks' && (
            <TasksView onOpenDetails={(task) => setSelectedTaskForDetail(task)} />
          )}
          {activeView === 'schedule' && <ScheduleView />}
          {activeView === 'calendar' && <CalendarView />}
          {activeView === 'disciplines' && <DisciplinesView />}
          {activeView === 'progress' && <ProgressView />}
          {activeView === 'materials' && <MaterialsView />}
          {activeView === 'notices' && <NoticesView />}
          {activeView === 'profile' && <ProfileView />}
          {activeView === 'settings' && <SettingsView />}
          {activeView === 'campus-map' && <CampusMapView />}
        </main>
      </div>

      {/* Botão Flutuante do Copiloto Folium (Exatamente como a estrela/sparkles na referência) */}
      <button
        onClick={() => setIsCopilotOpen(!isCopilotOpen)}
        className="fixed bottom-20 md:bottom-6 right-5 sm:right-6 w-13 h-13 rounded-full bg-[#203A65] text-white shadow-xl flex items-center justify-center hover:bg-[#182C4F] active:scale-95 transition-all z-40 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#203A65]/40 cursor-pointer border border-white/20"
        aria-label="Abrir Copiloto Folium"
        title="Copiloto Folium"
      >
        <Sparkles className="w-6 h-6 text-white" />
      </button>

      {/* Modal do Copiloto Folium */}
      <CopilotModal />

      {/* Modal de Detalhes e Entrega de Arquivo da Tarefa Acadêmica */}
      <TaskDetailModal
        task={selectedTaskForDetail}
        isOpen={!!selectedTaskForDetail}
        onClose={() => setSelectedTaskForDetail(null)}
      />

      {/* Guia Inteligente de Localização e Mapa 3D do Campus */}
      <CampusMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        targetRoom={targetRoomForMap}
      />

      {/* Barra de Navegação Inferior (Mobile Only) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#14223D] border-t border-slate-200 dark:border-white/10 flex justify-around py-2 z-30 shadow-lg transition-colors duration-250"
        aria-label="Navegação Inferior Mobile"
      >
        {MOBILE_BOTTOM_NAV.map((item) => {
          const Icon = item.icon;
          const isMore = item.id === 'more';
          const isActive = !isMore && activeView === item.id;
          const isTask = item.id === 'tasks';

          return (
            <button
              key={item.id}
              onClick={() => {
                if (isMore) {
                  setIsMobileMenuOpen(true);
                } else {
                  setActiveView(item.id as ViewType);
                }
              }}
              className={`flex flex-col items-center py-1 px-3 text-[10px] font-semibold transition-colors cursor-pointer relative ${
                isActive ? 'text-[#203A65]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5 mb-0.5" />
                {isTask && pendingCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-red-600 text-white rounded-full text-[9px] flex items-center justify-center font-mono font-bold">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default function App() {
  return (
    <EduProvider>
      <MainContent />
    </EduProvider>
  );
}
