import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  AlertOctagon,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Lightbulb,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { useEdu } from '../context/EduContext';

export const ScheduleView: React.FC = () => {
  const { tasks, events, addEvent, deleteEvent, openLocationGuide } = useEdu();

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Form de agendamento manual
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [location, setLocation] = useState('');
  const [conflictData, setConflictData] = useState<{
    message: string;
    suggestedTime?: string;
  } | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Navegação de dias
  const changeDay = (deltaDays: number) => {
    const current = new Date(`${selectedDate}T12:00:00`);
    current.setDate(current.getDate() + deltaDays);
    setSelectedDate(current.toISOString().split('T')[0]);
    setConflictData(null);
    setSuccessNotice(null);
  };

  const setToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setConflictData(null);
    setSuccessNotice(null);
  };

  // Tarefas que têm prazo de entrega nesta data (Diferenciação visual explícita)
  const deadlinedTasksForDay = useMemo(() => {
    return tasks.filter((t) => t.deadline === selectedDate);
  }, [tasks, selectedDate]);

  // Sessões de estudo planejadas para esta data
  const dayEvents = useMemo(() => {
    return events
      .filter((e) => e.date === selectedDate)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [events, selectedDate]);

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictData(null);
    setSuccessNotice(null);

    if (!selectedTaskId) {
      setConflictData({
        message: 'Por favor, selecione uma tarefa acadêmica para agendar a sessão.',
      });
      return;
    }

    const result = addEvent({
      taskId: selectedTaskId,
      date: selectedDate,
      startTime,
      durationMinutes: Number(durationMinutes),
      location: location.trim() ? location.trim() : undefined,
    });

    if (!result.success && result.conflict) {
      const conflictTask = tasks.find((t) => t.id === result.conflict?.taskId);
      setConflictData({
        message: `Conflito de horário detectado: você já possui a sessão "${conflictTask?.title || 'Estudo'}" agendada às ${result.conflict.startTime} (${result.conflict.durationMinutes} min).`,
        suggestedTime: result.suggestedTime,
      });
    } else if (result.success) {
      setSuccessNotice(`Sessão de estudo reservada com sucesso para às ${startTime}!`);
      setTimeout(() => setSuccessNotice(null), 3500);
      setSelectedTaskId('');
      setLocation('');
    }
  };

  // Aceitar horário sugerido
  const acceptSuggestedTime = () => {
    if (conflictData?.suggestedTime) {
      setStartTime(conflictData.suggestedTime);
      setConflictData(null);
    }
  };

  // Formatador da data por extenso
  const formattedDateTitle = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [selectedDate]);

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Topo com Navegação Diária */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Agenda Acadêmica Diária
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Planejamento manual de horários de estudo com prevenção ativa de conflitos e suporte a locais.
          </p>
        </div>

        {/* Controles de Data */}
        <div className="flex items-center space-x-2 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <button
            onClick={() => changeDay(-1)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Dia anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {!isToday && (
            <button
              onClick={setToday}
              className="px-2.5 py-1 text-xs font-semibold text-[#203A65] bg-[#EAF0F7] rounded-lg hover:bg-[#d8e4f2] transition-colors cursor-pointer"
            >
              Hoje
            </button>
          )}

          <div className="flex items-center space-x-1.5 px-2">
            <Calendar className="w-4 h-4 text-[#203A65]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setConflictData(null);
              }}
              className="text-xs sm:text-sm font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer font-mono"
            />
          </div>

          <button
            onClick={() => changeDay(1)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Próximo dia"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Identificador do Dia Selecionado */}
      <div className="bg-white px-5 py-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CalendarCheck className="w-5 h-5 text-[#203A65]" />
          <span className="text-sm font-bold text-slate-900 capitalize">
            {formattedDateTitle}
          </span>
        </div>
        {isToday && (
          <span className="text-xs font-bold text-[#203A65] bg-[#EAF0F7] px-2.5 py-0.5 rounded-full">
            Hoje
          </span>
        )}
      </div>

      {/* Grid Principal: Formulário de Agendamento + Timeline e Prazos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário Manual de Reserva de Bloco de Estudo */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 h-fit">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 mb-4">
            <Clock className="w-4 h-4 text-[#203A65]" />
            <h3 className="font-bold text-sm text-slate-900">
              Reservar Bloco de Estudo
            </h3>
          </div>

          {/* Alerta de Conflito com Sugestão Opcional */}
          {conflictData && (
            <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
              <div className="flex items-start space-x-2">
                <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">
                  {conflictData.message}
                </span>
              </div>
              {conflictData.suggestedTime && (
                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
                  <span className="text-amber-800 text-[11px] font-semibold flex items-center space-x-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                    <span>Sugerido: às {conflictData.suggestedTime}</span>
                  </span>
                  <button
                    type="button"
                    onClick={acceptSuggestedTime}
                    className="text-[11px] font-bold text-[#203A65] bg-white px-2.5 py-1 rounded-md border border-amber-300 hover:bg-amber-100 cursor-pointer"
                  >
                    Usar este horário
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Feedback de Sucesso */}
          {successNotice && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          <form onSubmit={handleScheduleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tarefa a Trabalhar <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedTaskId}
                onChange={(e) => {
                  setSelectedTaskId(e.target.value);
                  setConflictData(null);
                }}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#203A65] cursor-pointer"
              >
                <option value="">Selecione uma tarefa pendente...</option>
                {tasks
                  .filter((t) => !t.completed)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.discipline})
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Horário de Início
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    setConflictData(null);
                  }}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#203A65]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Duração
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => {
                    setDurationMinutes(Number(e.target.value));
                    setConflictData(null);
                  }}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#203A65] cursor-pointer"
                >
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>60 min (1h)</option>
                  <option value={90}>90 min (1h30)</option>
                  <option value={120}>120 min (2h)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Local ou Sala (Opcional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Laboratório de Redes — Sala 204"
                  className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#203A65]"
                />
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#203A65] text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#182C4F] active:scale-[0.98] transition-all shadow-sm cursor-pointer"
            >
              Agendar Bloco de Estudo
            </button>
          </form>

          <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
            Nota: Todo agendamento é manual. O sistema alerta sobre conflitos, mas não altera sua rotina automaticamente.
          </p>
        </div>

        {/* Linha do Tempo e Prazos Finais */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card Especial: Prazos Finais de Entrega para esta Data */}
          <div className="bg-white rounded-2xl border border-red-200/90 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-red-100 mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <h3 className="font-bold text-xs sm:text-sm text-red-950 uppercase tracking-wide">
                  Prazos Finais de Entrega para Este Dia ({deadlinedTasksForDay.length})
                </h3>
              </div>
              <span className="text-[11px] text-red-600 font-semibold">
                Prazo Limite Institucional
              </span>
            </div>

            {deadlinedTasksForDay.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">
                Nenhuma tarefa com prazo final de entrega fixado para esta data.
              </p>
            ) : (
              <div className="space-y-2.5">
                {deadlinedTasksForDay.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl bg-red-50/60 border border-red-200 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs sm:text-sm text-red-950 truncate">
                          {t.title}
                        </span>
                        {t.completed && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                            Concluída
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-red-800 mt-0.5">{t.discipline}</p>
                    </div>

                    <span className="text-xs font-mono font-bold text-red-700 bg-white px-2.5 py-1 rounded-md border border-red-200 shrink-0">
                      Prazo: 23:59
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timeline de Sessões de Estudo Planejadas */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#203A65]" />
                <h3 className="font-bold text-sm text-slate-900">
                  Horários Reservados para Estudo ({dayEvents.length})
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Blocos de dedicação pessoal
              </span>
            </div>

            {dayEvents.length === 0 ? (
              <div className="p-8 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">
                  Nenhum horário reservado para este dia
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Selecione uma tarefa ao lado e reserve um período para se dedicar a ela.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {dayEvents.map((evt) => {
                  const task = tasks.find((t) => t.id === evt.taskId);
                  const mapsUrl = evt.location
                    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(evt.location)}`
                    : null;

                  return (
                    <div
                      key={evt.id}
                      className="p-4 rounded-xl bg-[#EAF0F7]/40 border border-[#203A65]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#EAF0F7]/60 transition-colors"
                    >
                      <div className="flex items-start space-x-3.5 min-w-0">
                        <div className="text-center bg-white px-3 py-1.5 rounded-lg border border-[#203A65]/10 shrink-0">
                          <p className="text-xs font-bold text-[#203A65] font-mono tabular-nums">
                            {evt.startTime}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {evt.durationMinutes} min
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {task ? task.title : 'Tarefa acadêmica'}
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5 truncate">
                            {task ? task.discipline : 'Geral'}
                          </p>
                          {evt.location && (
                            <div className="flex items-center space-x-2 mt-1.5">
                              <span className="inline-flex items-center space-x-1 text-xs text-slate-700 font-medium">
                                <MapPin className="w-3.5 h-3.5 text-[#203A65] shrink-0" />
                                <span className="truncate">{evt.location}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => openLocationGuide({ room: evt.location, date: selectedDate })}
                                className="text-[11px] text-[#203A65] font-semibold hover:underline inline-flex items-center space-x-0.5 cursor-pointer"
                                title="Localizar sala no Mapa 3D do Campus"
                              >
                                <span>Ver no mapa 3D</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-end space-x-2 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => deleteEvent(evt.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                          aria-label="Remover sessão de estudo"
                          title="Desmarcar este horário"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
