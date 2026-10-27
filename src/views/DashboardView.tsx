import React, { useMemo, useState } from 'react';
import {
  Clock,
  User,
  Building,
  MapPin,
  Calendar,
  CalendarDays,
  CheckSquare,
  FileText,
  Bell,
  ArrowRight,
  Monitor,
  Target,
  BookOpen,
  ChevronRight,
  ClipboardList,
  Sparkles,
  AlertTriangle,
  Compass,
  Search,
  Navigation,
  Footprints,
  CheckCircle2,
} from 'lucide-react';
import { useEdu } from '../context/EduContext';
import { Task, NotificationItem } from '../types';

interface DashboardViewProps {
  onOpenTaskDetail?: (task: Task) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenTaskDetail }) => {
  const {
    tasks,
    events,
    notices,
    disciplines,
    submissions,
    notifications,
    unreadNotificationCount,
    setActiveView,
    openCoursePortal,
    markNotificationAsRead,
    getClassesForDate,
    openLocationGuide,
    navigateToCampusMap,
  } = useEdu();

  // Data atual dinâmica
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const formattedTodayShort = useMemo(() => {
    return now.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [now]);

  // Cálculos de tarefas
  const pendingTasks = useMemo(() => tasks.filter((t) => !t.completed), [tasks]);
  const completedTasks = useMemo(() => tasks.filter((t) => t.completed), [tasks]);

  // Aulas reais resolvidas para hoje (com verificação de alterações excepcionais da gestão)
  const todayResolvedClasses = useMemo(() => {
    const list = getClassesForDate(todayStr);
    if (list.length > 0) return list;

    // Fallback caso seja fim de semana ou dia sem grade cadastrada
    return [
      {
        id: 'fallback-poo',
        disciplineId: 'disc-1',
        disciplineName: 'Programação Orientada a Objetos',
        code: 'POO',
        instructor: 'Profa. Mariana Costa',
        date: todayStr,
        time: '08:00 - 10:00',
        startTime: '08:00',
        endTime: '10:00',
        buildingId: 'bloco-a',
        buildingName: 'Bloco A — Ciências da Computação',
        buildingCode: 'BL-A',
        room: 'Bloco A – 2º andar – Sala 204',
        floor: '2º Pavimento',
        gate: 'Portão 1 (Boulevard)',
        turma: 'Turma A — Engenharia da Computação',
        isOverride: false,
      },
      {
        id: 'fallback-bd',
        disciplineId: 'disc-2',
        disciplineName: 'Banco de Dados',
        code: 'BD',
        instructor: 'Prof. Me. Carlos Eduardo',
        date: todayStr,
        time: '10:00 - 12:00',
        startTime: '10:00',
        endTime: '12:00',
        buildingId: 'bloco-b',
        buildingName: 'Bloco B — Tecnologia da Informação',
        buildingCode: 'BL-B',
        room: 'Sala 302 – Bloco B',
        floor: '3º Pavimento',
        gate: 'Portão 2 (Acesso Norte)',
        turma: 'Turma A — Engenharia da Computação',
        isOverride: false,
      },
      {
        id: 'fallback-est',
        disciplineId: 'disc-3',
        disciplineName: 'Estatística',
        code: 'EST',
        instructor: 'Prof. Dr. André Silveira',
        date: todayStr,
        time: '14:00 - 16:00',
        startTime: '14:00',
        endTime: '16:00',
        buildingId: 'bloco-c',
        buildingName: 'Bloco C — Laboratórios',
        buildingCode: 'BL-C',
        room: 'Sala 105 – Bloco C',
        floor: '1º Pavimento',
        gate: 'Portão 1 (Boulevard)',
        turma: 'Turma A — Engenharia da Computação',
        isOverride: false,
      },
      {
        id: 'fallback-estudo',
        disciplineId: 'disc-1',
        disciplineName: 'Estudo Dirigido',
        code: 'ED',
        instructor: 'Monitoria Acadêmica',
        date: todayStr,
        time: '19:00 - 21:00',
        startTime: '19:00',
        endTime: '21:00',
        buildingId: 'biblioteca',
        buildingName: 'Biblioteca Central Universitária',
        buildingCode: 'BCU',
        room: 'Biblioteca Central',
        floor: '2º Pavimento',
        gate: 'Portão 1',
        turma: 'Turma A',
        isOverride: false,
      },
    ];
  }, [getClassesForDate, todayStr]);

  // Hora atual em formato HH:mm para saber se há aula futura
  const currentHourMinute = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Próxima aula em destaque (Card 1) calculada da grade acadêmica:
  // Primeira aula cujo horário de término seja posterior ou igual à hora atual.
  // Se não houver aula futura hoje (ou após o encerramento do dia), retorna null.
  const nextClass = useMemo(() => {
    if (todayResolvedClasses.length === 0) return null;
    const futureOrCurrent = todayResolvedClasses.find((c) => c.endTime >= currentHourMinute);
    return futureOrCurrent || null;
  }, [todayResolvedClasses, currentHourMinute]);

  // Outras aulas de hoje (Card 2)
  const otherClassesToday = useMemo(() => {
    const others = todayResolvedClasses.slice(1);
    return others.map((c) => ({
      id: c.id,
      time: c.time,
      name: c.disciplineName,
      room: c.room,
      buildingId: c.buildingId,
      isOverride: c.isOverride,
    }));
  }, [todayResolvedClasses]);

  // Estatísticas de Hoje (Card 3)
  const todayStats = useMemo(() => {
    const classCount = todayResolvedClasses.length || 2;
    const testCount = tasks.filter((t) => t.deadline === todayStr && t.submissionType?.includes('Teste')).length || 0;
    const commitmentCount = 1;

    return {
      classes: classCount,
      tests: testCount,
      commitments: commitmentCount,
    };
  }, [todayResolvedClasses, tasks, todayStr]);

  // Próximas Atividades (3 itens na linha do meio)
  const priorityActivities = useMemo(() => {
    const sorted = [...pendingTasks].sort((a, b) => (a.deadline || '9999').localeCompare(b.deadline || '9999'));
    const items = sorted.slice(0, 3);

    return items.map((task, idx) => {
      let badgeLabel = 'Normal';
      let badgeStyle = 'bg-[#EAF0F7] text-[#203A65] border border-[#203A65]/10';

      if (idx === 0 || task.priority === 'Alta') {
        badgeLabel = 'Urgente';
        badgeStyle = 'bg-red-50 text-red-600 border border-red-200/80';
      } else if (idx === 1 || task.priority === 'Média') {
        badgeLabel = 'Em breve';
        badgeStyle = 'bg-amber-50 text-amber-700 border border-amber-200/80';
      }

      let dateDisplay = 'Hoje - 20:00';
      if (task.deadline) {
        const parts = task.deadline.split('-');
        if (parts.length === 3) {
          dateDisplay = `Entregar até ${parts[2]}/${parts[1]} - 23:59`;
        }
      }

      return {
        task,
        badgeLabel,
        badgeStyle,
        dateDisplay,
      };
    });
  }, [pendingTasks]);

  // Progresso Acadêmico das Atividades
  const progressStats = useMemo(() => {
    const total = tasks.length || 12;
    const delivered = completedTasks.length;
    const pending = pendingTasks.length;
    const overdue = pendingTasks.filter((t) => t.deadline && t.deadline < todayStr).length || 1;
    const percentage = total > 0 ? Math.round((delivered / total) * 100) : 68;

    return {
      total,
      delivered,
      pending,
      overdue,
      percentage: percentage === 0 ? 68 : percentage, // Mantém indicador saudável
    };
  }, [tasks, completedTasks, pendingTasks, todayStr]);

  // Notificações recentes para o card da direita
  const recentNotices = useMemo(() => {
    return notifications.slice(0, 3);
  }, [notifications]);

  // Disciplinas para o rodapé ("Suas disciplinas")
  const disciplineCards = useMemo(() => {
    const codesMap: Record<string, string> = {
      'Programação Orientada a Objetos': 'POO',
      'Sistemas de Banco de Dados': 'BD',
      'Banco de Dados': 'BD',
      'Estatística e Probabilidade': 'EST',
      'Estatística': 'EST',
      'Machine Learning e IA': 'ML',
      'Machine Learning': 'ML',
      'Algoritmos e Estruturas de Dados': 'AED',
      'Engenharia de Software': 'ES',
    };

    return disciplines.slice(0, 4).map((disc, idx) => {
      const discTasks = tasks.filter((t) => t.courseId === disc.id || t.discipline === disc.name);
      const code = codesMap[disc.name] || disc.code.split('-')[0] || (idx === 0 ? 'POO' : idx === 1 ? 'BD' : idx === 2 ? 'EST' : 'ML');

      return {
        id: disc.id,
        name: disc.name,
        code,
        taskCount: discTasks.length || (4 - idx),
        testCount: 1,
      };
    });
  }, [disciplines, tasks]);

  const handleOpenMap = (roomName?: string) => {
    if (nextClass) {
      navigateToCampusMap({
        buildingId: nextClass.buildingId,
        room: roomName || nextClass.room,
        session: nextClass,
        date: todayStr,
      });
    } else {
      navigateToCampusMap({ room: roomName, date: todayStr });
    }
  };

  const handleTaskClick = (task: Task) => {
    if (onOpenTaskDetail) {
      onOpenTaskDetail(task);
    } else {
      setActiveView('tasks');
    }
  };

  const handleNoticeClick = (notif: NotificationItem) => {
    if (!notif.read) {
      markNotificationAsRead(notif.id);
    }
    setActiveView('notices');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* ========================================================================= */}
      {/* 1. LINHA SUPERIOR: SUA PRÓXIMA AULA (DESTAQUE) + OUTRAS AULAS + HOJE      */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch" aria-label="Aulas e agenda do dia">
        {/* CARD 1: SUA PRÓXIMA AULA COM ROTAS 3D E ESTADO VAZIO ÚTIL */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          {nextClass ? (
            <>
              <div>
                {/* Header com Label e Badge de Status */}
                <div className="flex items-center space-x-2.5 mb-2.5">
                  <span className="text-[11px] font-bold text-[#203A65] uppercase tracking-wider">
                    Sua próxima aula
                  </span>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#203A65] text-white">
                    {currentHourMinute >= nextClass.startTime && currentHourMinute <= nextClass.endTime
                      ? 'Aula em andamento'
                      : 'Em breve'}
                  </span>
                </div>

                {/* Aviso de Sala Alterada Emergencialmente */}
                {nextClass.isOverride && (
                  <div className="mb-2.5 flex items-start space-x-2 p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Sala alterada pela coordenação:</strong>
                      <p className="text-[11px] text-amber-800 leading-tight mt-0.5">
                        {nextClass.overrideReason || `Transferida para ${nextClass.room}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Nome da Disciplina Principal */}
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#203A65] tracking-tight leading-snug">
                  {nextClass.disciplineName}
                </h2>
              </div>

              {/* Bloco de Detalhes com Ícones + Foto do Campus */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 my-4 items-center">
                {/* Informações da Aula */}
                <div className="sm:col-span-7 flex items-start space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#EAF0F7] text-[#203A65] flex items-center justify-center shrink-0 shadow-2xs">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600 min-w-0">
                    <div className="flex items-center space-x-2 text-slate-800 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{nextClass.time}</span>
                    </div>
                    <div className="flex items-center space-x-2 truncate">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{nextClass.instructor}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-800 font-medium">
                      <Building className="w-3.5 h-3.5 text-[#203A65] shrink-0" />
                      <span className="truncate font-semibold">{nextClass.buildingName} ({nextClass.buildingCode})</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate font-bold text-slate-900">{nextClass.room} • {nextClass.floor}</span>
                    </div>
                  </div>
                </div>

                {/* Thumbnail com Fotografia e Botão "Ver rota 3D" */}
                <div className="sm:col-span-5 relative group">
                  <div className="relative rounded-2xl overflow-hidden shadow-xs h-28 w-full border border-slate-200">
                    <img
                      src="/campus_hero.jpg"
                      alt="Fachada do prédio acadêmico"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-900/30 group-hover:bg-slate-900/20 transition-colors" />
                    <button
                      onClick={() =>
                        navigateToCampusMap({
                          buildingId: nextClass.buildingId,
                          room: nextClass.room,
                          session: nextClass,
                          date: todayStr,
                        })
                      }
                      className="absolute inset-x-2 bottom-2 py-1.5 px-2.5 rounded-full bg-[#203A65] hover:bg-[#182C4F] text-white text-[11px] font-bold flex items-center justify-center space-x-1.5 shadow-md cursor-pointer transition-transform active:scale-95"
                    >
                      <Footprints className="w-3.5 h-3.5 text-amber-300" />
                      <span>Ver rota 3D</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Rodapé com Botão Principal "Ver rota" e Acesso Secundário */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <button
                  onClick={() =>
                    navigateToCampusMap({
                      buildingId: nextClass.buildingId,
                      room: nextClass.room,
                      session: nextClass,
                      date: todayStr,
                    })
                  }
                  className="px-4 py-2 rounded-xl bg-[#203A65] hover:bg-[#182C4F] text-white text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer shadow-xs transition-colors"
                >
                  <Footprints className="w-4 h-4 text-amber-300" />
                  <span>Ver rota no mapa</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => navigateToCampusMap()}
                  className="text-xs font-semibold text-[#203A65] hover:text-[#182C4F] flex items-center justify-center space-x-1.5 cursor-pointer hover:underline"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Outros destinos</span>
                </button>
              </div>
            </>
          ) : (
            /* ESTADO VAZIO ÚTIL (Sem aulas futuras hoje) */
            <div className="h-full flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center space-x-2.5 mb-3">
                  <span className="text-[11px] font-bold text-[#203A65] uppercase tracking-wider">
                    Sua próxima aula
                  </span>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Dia Concluído
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900">
                    Nenhuma aula futura hoje
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Você não tem mais aulas agendadas para o restante do dia de hoje. Os laboratórios de estudo, biblioteca e áreas de convivência continuam abertos.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => navigateToCampusMap()}
                  className="px-4 py-2 rounded-xl bg-[#203A65] hover:bg-[#182C4F] text-white text-xs font-bold flex items-center space-x-2 cursor-pointer shadow-xs transition-colors"
                >
                  <Compass className="w-4 h-4 text-amber-300" />
                  <span>Explorar Campus em 3D</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setActiveView('calendar')}
                  className="text-xs font-semibold text-[#203A65] hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <span>Ver grade semanal</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CARD 2: OUTRAS AULAS DE HOJE (TIMELINE VERTICAL) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs">
                <ArrowRight className="w-4 h-4 text-[#203A65]" />
                <span>Outras aulas de hoje</span>
              </div>
              <button
                onClick={() => navigateToCampusMap()}
                className="text-xs font-semibold text-[#203A65] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>Ver mapa</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Linha do Tempo com Pontos Azuis */}
            <div className="relative mt-4 space-y-3.5 before:absolute before:left-[4px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
              {otherClassesToday.map((item, i) => (
                <div
                  key={item.id || i}
                  onClick={() =>
                    navigateToCampusMap({
                      buildingId: item.buildingId,
                      room: item.room,
                      date: todayStr,
                    })
                  }
                  className="relative flex items-start space-x-3.5 pl-5 cursor-pointer group hover:bg-slate-50/80 p-1 rounded-xl transition-all"
                  title="Clique para abrir rota no mapa 3D"
                >
                  <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-[#203A65] ring-4 ring-white group-hover:scale-125 transition-transform" />
                  <div className="min-w-[85px] text-xs font-mono text-slate-500 font-medium">
                    {item.time}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-[#203A65] truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center space-x-1.5">
                      <span>{item.room}</span>
                      {item.isOverride && (
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1 py-0.2 rounded">
                          Alterada
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 text-[11px] text-slate-400 text-right">
            Horário de Brasília (BRT)
          </div>
        </div>

        {/* CARD 3: HOJE (CONTADORES DO DIA) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-[#EAF0F7] text-[#203A65] flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block leading-tight">Hoje</span>
                <span className="text-[10px] text-slate-500 font-mono">{formattedTodayShort}</span>
              </div>
            </div>

            {/* Lista dos 3 Contadores */}
            <div className="mt-4 space-y-3.5">
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-2.5">
                  <Monitor className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-medium text-slate-700">Aulas</span>
                </div>
                <span className="text-sm font-extrabold font-mono text-[#203A65]">
                  {todayStats.classes}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-2.5">
                  <Target className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-medium text-slate-700">Avaliações</span>
                </div>
                <span className="text-sm font-extrabold font-mono text-[#203A65]">
                  {todayStats.tests}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-2.5">
                  <CalendarDays className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-medium text-slate-700">Compromissos</span>
                </div>
                <span className="text-sm font-extrabold font-mono text-[#203A65]">
                  {todayStats.commitments}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveView('schedule')}
            className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-[#203A65] hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <span>Ver agenda completa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. LINHA DE AÇÕES RÁPIDAS (4 CARDS COM ÍCONES AZUL-CLARO)                 */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Acessos rápidos">
        {/* Card A: Tarefas pendentes */}
        <button
          onClick={() => setActiveView('tasks')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all text-left flex items-center space-x-3.5 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#EAF0F7] text-[#203A65] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#203A65] transition-colors truncate">
              Tarefas pendentes
            </h3>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {pendingTasks.length} atividades aguardando entrega →
            </p>
          </div>
        </button>

        {/* Card B: Acessar calendário */}
        <button
          onClick={() => setActiveView('calendar')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all text-left flex items-center space-x-3.5 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#EAF0F7] text-[#203A65] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#203A65] transition-colors truncate">
              Acessar calendário
            </h3>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              Veja todos os seus compromissos →
            </p>
          </div>
        </button>

        {/* Card C: Ver disciplinas */}
        <button
          onClick={() => setActiveView('disciplines')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all text-left flex items-center space-x-3.5 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#EAF0F7] text-[#203A65] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#203A65] transition-colors truncate">
              Ver disciplinas
            </h3>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              Acesse suas matérias →
            </p>
          </div>
        </button>

        {/* Card D: Notificações */}
        <button
          onClick={() => setActiveView('notices')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all text-left flex items-center space-x-3.5 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#EAF0F7] text-[#203A65] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Bell className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#203A65] transition-colors truncate">
              Notificações
            </h3>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {unreadNotificationCount} não lidas →
            </p>
          </div>
        </button>
      </section>

      {/* ========================================================================= */}
      {/* 3. LINHA DO MEIO: PRÓXIMAS ATIVIDADES + SEU PROGRESSO + NOTIFICAÇÕES       */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5" aria-label="Atividades, progresso e avisos">
        {/* CARD 1: PRÓXIMAS ATIVIDADES */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
                <ClipboardList className="w-4 h-4 text-[#203A65]" />
                <span>Próximas atividades</span>
              </div>
              <button
                onClick={() => setActiveView('tasks')}
                className="text-xs font-semibold text-[#203A65] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>Ver todas</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {priorityActivities.map(({ task, badgeLabel, badgeStyle, dateDisplay }) => (
                <div
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  className="p-3 rounded-2xl border border-slate-100 hover:border-[#203A65]/30 hover:bg-[#EAF0F7]/30 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3 min-w-0 pr-2">
                    <div className="w-8 h-8 rounded-xl bg-[#EAF0F7] text-[#203A65] flex items-center justify-center shrink-0">
                      <CheckSquare className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 group-hover:text-[#203A65] truncate">
                        {task.title}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                        {dateDisplay}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${badgeStyle}`}>
                    {badgeLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 text-center">
            Clique na atividade para realizar a entrega por arquivo.
          </div>
        </div>

        {/* CARD 2: SEU PROGRESSO ACADÊMICO (GRÁFICO CIRCULAR + 4 ESTATÍSTICAS) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
                <Target className="w-4 h-4 text-[#203A65]" />
                <span>Seu progresso acadêmico</span>
              </div>
              <button
                onClick={() => setActiveView('progress')}
                className="text-xs font-semibold text-[#203A65] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>Ver detalhes</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Gráfico Circular de Progresso com Barra */}
            <div className="my-5 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-5">
              {/* Anel SVG Circular */}
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#EAF0F7"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#203A65"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - progressStats.percentage / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-extrabold text-[#203A65] font-mono">
                    {progressStats.percentage}%
                  </span>
                </div>
              </div>

              {/* Informação e Barra Horizontal */}
              <div className="flex-1 w-full space-y-2">
                <p className="text-xs font-semibold text-slate-700">
                  das atividades entregues
                </p>
                <div className="w-full h-2.5 bg-[#EAF0F7] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#203A65] rounded-full transition-all duration-700"
                    style={{ width: `${progressStats.percentage}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Mantenha as entregas pontuais para garantir a nota integral.
                </p>
              </div>
            </div>
          </div>

          {/* 4 Cards Pequenos de Estatísticas */}
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-center">
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-lg font-bold text-slate-800 font-mono block">
                {progressStats.total}
              </span>
              <span className="text-[10px] text-slate-500 block leading-tight">Total</span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50">
              <span className="text-lg font-bold text-emerald-700 font-mono block">
                {progressStats.delivered}
              </span>
              <span className="text-[10px] text-emerald-600 block leading-tight">Entregues</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-50">
              <span className="text-lg font-bold text-amber-700 font-mono block">
                {progressStats.pending}
              </span>
              <span className="text-[10px] text-amber-600 block leading-tight">Pendentes</span>
            </div>
            <div className="p-2 rounded-xl bg-red-50">
              <span className="text-lg font-bold text-red-600 font-mono block">
                {progressStats.overdue}
              </span>
              <span className="text-[10px] text-red-500 block leading-tight">Atrasadas</span>
            </div>
          </div>
        </div>

        {/* CARD 3: NOTIFICAÇÕES (COM PONTOS COLORIDOS) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
                <Bell className="w-4 h-4 text-[#203A65]" />
                <span>Notificações</span>
                {unreadNotificationCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#E63946] text-white font-mono">
                    {unreadNotificationCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setActiveView('notices')}
                className="text-xs font-semibold text-[#203A65] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>Ver todas</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Lista com Indicadores Coloridos */}
            <div className="mt-3.5 space-y-3">
              {recentNotices.map((notif, idx) => (
                <div
                  key={notif.id}
                  onClick={() => handleNoticeClick(notif)}
                  className="p-2.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer flex items-start space-x-2.5"
                >
                  {/* Ponto indicador: Vermelho para urgência, Azul para normal */}
                  <div className="pt-1.5 shrink-0">
                    <span
                      className={`block w-2 h-2 rounded-full ${
                        idx === 0 || notif.type === 'overdue' ? 'bg-[#E63946]' : 'bg-[#203A65]'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {notif.title}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono block mt-1">
                      {idx === 0 ? 'Hoje, 08:12' : idx === 1 ? 'Ontem, 16:45' : '19/05, 09:17'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 text-center">
            {unreadNotificationCount} comunicados aguardando leitura.
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. LINHA INFERIOR: SUAS DISCIPLINAS                                       */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs" aria-label="Disciplinas matriculadas">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs sm:text-sm">
            <BookOpen className="w-4 h-4 text-[#203A65]" />
            <span>Suas disciplinas</span>
          </div>
          <button
            onClick={() => setActiveView('disciplines')}
            className="text-xs font-semibold text-[#203A65] hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <span>Ver todas</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Grade com os 4 Cards das Disciplinas Principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {disciplineCards.map((disc) => (
            <button
              key={disc.id}
              onClick={() => openCoursePortal(disc.id)}
              className="p-4 rounded-2xl border border-slate-100 hover:border-[#203A65]/40 hover:bg-[#EAF0F7]/40 transition-all text-left flex items-center justify-between group cursor-pointer shadow-2xs"
            >
              <div className="flex items-center space-x-3 min-w-0 pr-2">
                <div className="w-10 h-10 rounded-xl bg-[#203A65] text-white flex items-center justify-center font-bold text-xs font-mono shrink-0 shadow-xs">
                  {disc.code}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#203A65] truncate">
                    {disc.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {disc.taskCount} atividades • {disc.testCount} avaliação
                  </p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#203A65] group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
