import React, { useState, useMemo } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  RotateCcw,
  Clock,
  AlertTriangle,
  Info,
  Calendar,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useEdu } from '../context/EduContext';
import { NotificationItem, AcademicNotice } from '../types';

type NoticeFilter = 'all' | 'unread' | 'read';

export const NoticesView: React.FC = () => {
  const {
    notifications,
    notices,
    unreadNotificationCount,
    toggleNotificationRead,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setActiveView,
  } = useEdu();

  const [filter, setFilter] = useState<NoticeFilter>('all');
  const [feedback, setFeedback] = useState<string | null>(null);

  const readCount = notifications.length - unreadNotificationCount;

  // Filtra as notificações
  const displayedNotifications = useMemo(() => {
    if (filter === 'unread') return notifications.filter((n) => !n.read);
    if (filter === 'read') return notifications.filter((n) => n.read);
    return notifications;
  }, [notifications, filter]);

  const handleMarkAll = () => {
    if (unreadNotificationCount === 0) return;
    markAllNotificationsAsRead();
    setFeedback('Todas as notificações foram marcadas como lidas.');
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Topo com Título e Ação de Marcar Todas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Notificações & Comunicados Acadêmicos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Acompanhe avisos da coordenação, prazos iminentes e atualizações curriculares.
          </p>
        </div>

        {unreadNotificationCount > 0 && (
          <button
            onClick={handleMarkAll}
            className="inline-flex items-center space-x-2 bg-white text-[#203A65] border border-slate-200 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer w-fit"
          >
            <CheckCheck className="w-4 h-4 text-[#203A65]" />
            <span>Marcar Todas como Lidas ({unreadNotificationCount})</span>
          </button>
        )}
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-in fade-in duration-150">
          {feedback}
        </div>
      )}

      {/* Grid Principal: Lista Filtrável de Notificações + Comunicados Oficiais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1 & 2: Central de Notificações com Filtros */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          {/* Header com Filtros */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  filter === 'all'
                    ? 'bg-[#203A65] text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                Todas ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  filter === 'unread'
                    ? 'bg-[#203A65] text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                Não Lidas ({unreadNotificationCount})
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  filter === 'read'
                    ? 'bg-[#203A65] text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                Lidas ({readCount})
              </button>
            </div>
          </div>

          {/* Lista de Notificações */}
          <div className="divide-y divide-slate-100 flex-1">
            {displayedNotifications.length === 0 ? (
              <div className="p-12 text-center text-xs sm:text-sm text-slate-500">
                {filter === 'unread' && <p>Nenhuma notificação pendente de leitura.</p>}
                {filter === 'read' && <p>Nenhuma notificação foi marcada como lida.</p>}
                {filter === 'all' && <p>Nenhuma notificação disponível no momento.</p>}
              </div>
            ) : (
              displayedNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 sm:p-5 flex items-start justify-between gap-3 transition-colors ${
                    !notif.read ? 'bg-[#EAF0F7]/25' : 'bg-white opacity-85'
                  }`}
                >
                  <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                    {notif.type === 'overdue' ? (
                      <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    ) : notif.type === 'due_soon' ? (
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Clock className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-[#EAF0F7] text-[#203A65] flex items-center justify-center shrink-0 mt-0.5">
                        <Bell className="w-4 h-4" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <h4
                          className={`text-sm truncate ${
                            !notif.read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
                          }`}
                        >
                          {notif.title}
                        </h4>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-[#203A65] shrink-0" title="Não lida" />
                        )}
                      </div>

                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-2 font-mono">
                        <span>Data: {notif.date}</span>
                        {notif.taskId && (
                          <button
                            onClick={() => setActiveView('tasks')}
                            className="text-[#203A65] font-semibold hover:underline cursor-pointer"
                          >
                            Ver Tarefa Relacionada →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ação de Leitura */}
                  <div className="shrink-0 pt-0.5">
                    <button
                      onClick={() => toggleNotificationRead(notif.id)}
                      className={`p-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer ${
                        notif.read
                          ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                          : 'text-[#203A65] bg-white border border-slate-200 hover:bg-[#EAF0F7]'
                      }`}
                      title={notif.read ? 'Marcar como não lida' : 'Marcar como lida'}
                    >
                      {notif.read ? (
                        <>
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Não lida</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Lida</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Coluna 3: Comunicados Oficiais Cadastrados pela Gestão */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <ShieldCheck className="w-5 h-5 text-[#203A65]" />
              <h3 className="font-bold text-sm text-slate-900">
                Avisos Oficiais da Gestão
              </h3>
            </div>

            {notices.length === 0 ? (
              <p className="text-xs text-slate-400">Nenhum aviso institucional registrado.</p>
            ) : (
              <div className="space-y-3">
                {notices.map((n) => (
                  <div
                    key={n.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{n.title}</span>
                      {n.priority && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            n.priority === 'Alta'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-[#EAF0F7] text-[#203A65]'
                          }`}
                        >
                          {n.priority}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 leading-relaxed">{n.message}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 font-mono">
                      <span>{n.author || n.discipline}</span>
                      <span>{n.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
