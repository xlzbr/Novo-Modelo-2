import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Bell,
  User,
  Menu,
  AlertTriangle,
  Clock,
  ExternalLink,
  Check,
  CheckCheck,
  RotateCcw,
  Search,
  ChevronDown,
  X,
  BookOpen,
  CheckSquare,
  FileText,
  Settings,
  HelpCircle,
  Sun,
  Moon,
} from 'lucide-react';
import { useEdu } from '../context/EduContext';
import { NotificationItem, ViewType } from '../types';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

type NotifFilter = 'all' | 'unread' | 'read';

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const {
    tasks,
    disciplines,
    materials,
    notices,
    notifications,
    unreadNotificationCount,
    preferences,
    activeView,
    setIsMobileMenuOpen,
    setActiveView,
    toggleNotificationRead,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setIsCopilotOpen,
    theme,
    toggleTheme,
  } = useEdu();

  // Estados dos menus dropdown
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [filter, setFilter] = useState<NotifFilter>('all');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Estado da Busca Global
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fecha dropdowns ao clicar fora ou pressionar ESC
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(target)) {
        setIsSearchFocused(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsNotifOpen(false);
        setIsProfileOpen(false);
        setIsSearchFocused(false);
      }
      // Atalho de teclado Cmd+K / Ctrl+K para focar busca
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) {
          searchInput.focus();
          setIsSearchFocused(true);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const readCount = notifications.length - unreadNotificationCount;

  // Filtra as notificações conforme o filtro selecionado
  const displayedNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((n) => !n.read);
    }
    if (filter === 'read') {
      return notifications.filter((n) => n.read);
    }
    return notifications;
  }, [notifications, filter]);

  // Resultados da busca global
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || q.length < 2) return null;

    const matchedTasks = tasks
      .filter((t) => t.title.toLowerCase().includes(q) || t.discipline.toLowerCase().includes(q))
      .slice(0, 3);

    const matchedDisciplines = disciplines
      .filter((d) => d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q))
      .slice(0, 3);

    const matchedMaterials = materials
      .filter((m) => m.title.toLowerCase().includes(q) || m.discipline.toLowerCase().includes(q))
      .slice(0, 3);

    const matchedNotices = notices
      .filter((n) => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q))
      .slice(0, 3);

    const totalCount =
      matchedTasks.length + matchedDisciplines.length + matchedMaterials.length + matchedNotices.length;

    return {
      tasks: matchedTasks,
      disciplines: matchedDisciplines,
      materials: matchedMaterials,
      notices: matchedNotices,
      totalCount,
    };
  }, [searchQuery, tasks, disciplines, materials, notices]);

  const handleMarkAllRead = () => {
    if (unreadNotificationCount === 0) return;
    markAllNotificationsAsRead();
    setActionFeedback('Todas as notificações foram marcadas como lidas.');
    setTimeout(() => setActionFeedback(null), 2500);
  };

  const handleItemClick = (notif: NotificationItem) => {
    if (!notif.read) {
      markNotificationAsRead(notif.id);
    }
    if (notif.noticeId) {
      setActiveView('notices');
    } else {
      setActiveView('tasks');
    }
    setIsNotifOpen(false);
  };

  const handleToggleItemRead = (e: React.MouseEvent, notif: NotificationItem) => {
    e.stopPropagation();
    toggleNotificationRead(notif.id);
  };

  const handleSelectSearchResult = (view: ViewType) => {
    setActiveView(view);
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  const isDashboard = activeView === 'dashboard';

  // Data atual dinâmica em português brasileiro
  const now = new Date();
  const formattedTodayDate = useMemo(() => {
    const formatted = now.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }, [now]);

  const firstName = preferences.studentName.split(' ')[0] || 'Lucas';

  return (
    <header
      className={`relative z-30 shrink-0 text-white select-none transition-all duration-300 ${
        isDashboard
          ? 'bg-cover bg-center border-b border-[#1B3156]/40'
          : 'bg-[#203A65] border-b border-[#1B3156] h-16'
      }`}
      style={
        isDashboard
          ? {
              backgroundImage: `url('/campus_hero.jpg')`,
            }
          : undefined
      }
    >
      {/* Camada de sobreposição azul-marinho semitransparente no modo Dashboard */}
      {isDashboard && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#203A65]/95 via-[#203A65]/80 to-[#203A65]/65 backdrop-blur-[0.5px]" />
      )}

      {/* Conteúdo do Cabeçalho */}
      <div className="relative z-10">
        {/* Barra Superior: Busca, Notificações e Perfil */}
        <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Lado Esquerdo: Mobile Menu + Título da Página (quando não for Dashboard) */}
          <div className="flex items-center space-x-3.5 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-1 text-white/80 hover:text-white hover:bg-white/10 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 cursor-pointer"
              aria-label="Abrir menu de navegação"
            >
              <Menu className="w-5 h-5" />
            </button>

            {!isDashboard && (
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate flex items-center space-x-2">
                  <span>{title}</span>
                </h1>
                {subtitle && (
                  <p className="text-[11px] text-white/60 hidden lg:block truncate max-w-md">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Centro/Direita: Barra de Busca Estilo Glassmorphism */}
          <div className="flex items-center justify-end flex-1 space-x-3 sm:space-x-4">
            <div className="relative w-full max-w-xs sm:max-w-sm hidden sm:block" ref={searchRef}>
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-white/70 absolute left-3.5 pointer-events-none" />
                <input
                  id="global-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="Buscar no Folium..."
                  className="w-full bg-[#1A2E50]/70 hover:bg-[#1A2E50]/90 focus:bg-[#1A2E50] border border-white/20 focus:border-white/40 text-white placeholder-white/70 text-xs sm:text-sm rounded-full pl-9 pr-14 py-2 transition-all outline-none focus:ring-2 focus:ring-white/20 backdrop-blur-md"
                />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 p-0.5 text-white/70 hover:text-white cursor-pointer"
                    aria-label="Limpar busca"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd className="absolute right-3 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-white/60 bg-white/10 rounded border border-white/10">
                    ⌘K
                  </kbd>
                )}
              </div>

              {/* Painel de Resultados da Busca Global */}
              {isSearchFocused && searchResults && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200/90 py-2.5 z-50 max-h-96 overflow-y-auto">
                  <div className="px-4 py-1.5 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Resultados para "{searchQuery}"</span>
                    <span className="font-mono font-semibold">{searchResults.totalCount} encontrado(s)</span>
                  </div>

                  {searchResults.totalCount === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      Nenhum resultado acadêmico encontrado para "{searchQuery}".
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {searchResults.tasks.length > 0 && (
                        <div className="p-2">
                          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-2 mb-1 block">
                            Tarefas Acadêmicas
                          </span>
                          {searchResults.tasks.map((t) => (
                            <button
                              key={t.id}
                              onClick={() => handleSelectSearchResult('tasks')}
                              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-[#EAF0F7]/60 flex items-center justify-between group cursor-pointer"
                            >
                              <div className="flex items-center space-x-2.5 truncate">
                                <CheckSquare className="w-3.5 h-3.5 text-[#203A65] shrink-0" />
                                <span className="text-xs font-medium text-slate-800 group-hover:text-[#203A65] truncate">
                                  {t.title}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                                {t.discipline}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {searchResults.disciplines.length > 0 && (
                        <div className="p-2">
                          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-2 mb-1 block">
                            Disciplinas
                          </span>
                          {searchResults.disciplines.map((d) => (
                            <button
                              key={d.id}
                              onClick={() => handleSelectSearchResult('disciplines')}
                              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-[#EAF0F7]/60 flex items-center justify-between group cursor-pointer"
                            >
                              <div className="flex items-center space-x-2.5 truncate">
                                <BookOpen className="w-3.5 h-3.5 text-[#203A65] shrink-0" />
                                <span className="text-xs font-medium text-slate-800 group-hover:text-[#203A65] truncate">
                                  {d.name}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                                {d.code}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {searchResults.materials.length > 0 && (
                        <div className="p-2">
                          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-2 mb-1 block">
                            Materiais de Estudo
                          </span>
                          {searchResults.materials.map((m) => (
                            <button
                              key={m.id}
                              onClick={() => handleSelectSearchResult('materials')}
                              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-[#EAF0F7]/60 flex items-center justify-between group cursor-pointer"
                            >
                              <div className="flex items-center space-x-2.5 truncate">
                                <FileText className="w-3.5 h-3.5 text-[#203A65] shrink-0" />
                                <span className="text-xs font-medium text-slate-800 group-hover:text-[#203A65] truncate">
                                  {m.title}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                                {m.discipline}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sino de Notificações com Badge */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen((prev) => !prev)}
                className="relative p-2 text-white/90 hover:text-white hover:bg-white/15 rounded-full transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                aria-label={`Notificações acadêmicas: ${unreadNotificationCount} não lidas`}
                aria-expanded={isNotifOpen}
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center text-[10px] font-bold text-white bg-[#E63946] rounded-full font-mono tabular-nums ring-2 ring-[#203A65]">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {/* Menu Dropdown de Notificações */}
              {isNotifOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  role="dialog"
                  aria-label="Central de Notificações Folium"
                >
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-900 text-sm">
                        Notificações
                      </span>
                      {unreadNotificationCount > 0 ? (
                        <span className="text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md font-mono tabular-nums">
                          {unreadNotificationCount} não lida(s)
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          Todas lidas
                        </span>
                      )}
                    </div>

                    {unreadNotificationCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs font-semibold text-[#203A65] hover:text-[#182C4F] flex items-center space-x-1 cursor-pointer hover:underline"
                        title="Marcar todas as notificações como lidas"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Marcar lidas</span>
                      </button>
                    )}
                  </div>

                  <div className="px-4 py-2 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-xs gap-1">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setFilter('all')}
                        className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-medium ${
                          filter === 'all'
                            ? 'bg-white text-[#203A65] shadow-2xs font-semibold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                        }`}
                      >
                        Todas ({notifications.length})
                      </button>
                      <button
                        onClick={() => setFilter('unread')}
                        className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-medium ${
                          filter === 'unread'
                            ? 'bg-white text-[#203A65] shadow-2xs font-semibold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                        }`}
                      >
                        Não lidas ({unreadNotificationCount})
                      </button>
                      <button
                        onClick={() => setFilter('read')}
                        className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-medium ${
                          filter === 'read'
                            ? 'bg-white text-[#203A65] shadow-2xs font-semibold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                        }`}
                      >
                        Lidas ({readCount})
                      </button>
                    </div>
                  </div>

                  {actionFeedback && (
                    <div className="mx-4 my-2 p-2 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium">
                      {actionFeedback}
                    </div>
                  )}

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {displayedNotifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500">
                        Nenhuma notificação encontrada no filtro atual.
                      </div>
                    ) : (
                      displayedNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleItemClick(notif)}
                          className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-start space-x-3 text-left relative group ${
                            !notif.read ? 'bg-[#EAF0F7]/40' : 'bg-white opacity-85'
                          }`}
                        >
                          {notif.type === 'overdue' ? (
                            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                          ) : notif.type === 'due_soon' ? (
                            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                              <Clock className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-[#EAF0F7] text-[#203A65] flex items-center justify-center shrink-0 mt-0.5">
                              <Bell className="w-4 h-4" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0 pr-8">
                            <div className="flex items-center space-x-2">
                              <p
                                className={`text-xs truncate ${
                                  !notif.read ? 'font-bold text-slate-900' : 'font-medium text-slate-600'
                                }`}
                              >
                                {notif.title}
                              </p>
                              {!notif.read && (
                                <span
                                  className="w-2 h-2 rounded-full bg-[#203A65] shrink-0"
                                  title="Não lida"
                                  aria-label="Não lida"
                                />
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5 leading-snug line-clamp-2">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                              Prazo: {notif.date}
                            </span>
                          </div>

                          <button
                            onClick={(e) => handleToggleItemRead(e, notif)}
                            className="absolute right-3 top-3.5 p-1 rounded-md text-slate-400 hover:text-[#203A65] hover:bg-slate-100 transition-colors cursor-pointer"
                            title={notif.read ? 'Marcar como não lida' : 'Marcar como lida'}
                            aria-label={notif.read ? 'Marcar como não lida' : 'Marcar como lida'}
                          >
                            {notif.read ? (
                              <RotateCcw className="w-3.5 h-3.5" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="px-4 pt-2.5 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-500">
                    <span>Janela de alerta: {preferences.reminderLeadHours}h</span>
                    <button
                      onClick={() => {
                        setActiveView('notices');
                        setIsNotifOpen(false);
                      }}
                      className="text-[#203A65] font-semibold hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Ver Todos os Comunicados</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Botão Minimalista para Alternar entre Modo Claro e Escuro */}
            <button
              type="button"
              onClick={toggleTheme}
              className="relative p-2 text-white/90 hover:text-white hover:bg-white/15 rounded-full transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/40 active:scale-95 group shrink-0"
              aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
              title={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
            >
              <div className="relative w-5 h-5 flex items-center justify-center">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-amber-300 transition-transform duration-300 transform rotate-0 hover:-rotate-12 motion-reduce:transform-none" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-300 transition-transform duration-300 transform rotate-0 hover:rotate-45 motion-reduce:transform-none" />
                )}
              </div>
            </button>

            {/* Perfil do Estudante com Foto / Avatar Circular */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="flex items-center space-x-2.5 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-white/15 transition-all cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                title="Menu do estudante"
                aria-label="Menu do estudante"
                aria-expanded={isProfileOpen}
              >
                {/* Avatar Circular realista com moldura suave */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-700 text-white font-bold flex items-center justify-center text-xs ring-2 ring-white/30 shrink-0 shadow-inner overflow-hidden">
                  <span className="select-none font-semibold">LA</span>
                </div>
                <span className="text-xs font-semibold text-white truncate max-w-[110px] hidden sm:inline-block">
                  {preferences.studentName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-white/80 shrink-0 hidden sm:inline-block" />
              </button>

              {isProfileOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  role="menu"
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{preferences.studentName}</p>
                    <p className="text-[11px] text-slate-500 font-mono truncate">{preferences.studentEmail}</p>
                    {preferences.registrationNumber && (
                      <span className="inline-block mt-1 text-[10px] bg-[#EAF0F7] text-[#203A65] font-mono px-1.5 py-0.5 rounded font-semibold">
                        {preferences.registrationNumber}
                      </span>
                    )}
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setActiveView('profile');
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-[#EAF0F7]/60 hover:text-[#203A65] flex items-center space-x-2.5 cursor-pointer"
                      role="menuitem"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Meu Perfil</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveView('settings');
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-[#EAF0F7]/60 hover:text-[#203A65] flex items-center space-x-2.5 cursor-pointer"
                      role="menuitem"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Configurações</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsCopilotOpen(true);
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-[#EAF0F7]/60 hover:text-[#203A65] flex items-center space-x-2.5 cursor-pointer"
                      role="menuitem"
                    >
                      <HelpCircle className="w-4 h-4 text-slate-400" />
                      <span>Copiloto Folium</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bloco Hero Inferior (Exclusivo da visualização do Dashboard, como na imagem de referência) */}
        {isDashboard && (
          <div className="px-4 sm:px-6 lg:px-8 pb-8 pt-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <span className="text-xs text-white/90 font-medium block">
                {formattedTodayDate}
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center space-x-2.5">
                <span>Olá, {firstName}!</span>
                <span className="inline-block animate-wave origin-bottom-right">👋</span>
              </h1>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal pt-0.5">
                Aqui está o resumo da sua jornada acadêmica. Continue com dedicação e disciplina!
              </p>
            </div>

            <div className="hidden md:block text-right shrink-0">
              <p className="text-xs sm:text-sm text-white/85 italic font-medium">
                "Disciplina hoje, conquistas amanhã."
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
