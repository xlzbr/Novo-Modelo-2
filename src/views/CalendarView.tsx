import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  CalendarDays,
  Layers,
  BookOpen,
  Info,
} from 'lucide-react';
import { useEdu } from '../context/EduContext';
import { ScheduleEvent, Task } from '../types';

type CalendarMode = 'diaria' | 'semanal' | 'mensal';

export const CalendarView: React.FC = () => {
  const { events, tasks, disciplines, openLocationGuide } = useEdu();

  const [mode, setMode] = useState<CalendarMode>('semanal');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);

  // Formata data ISO (YYYY-MM-DD)
  const toISODate = (d: Date) => d.toISOString().split('T')[0];

  // Navegação entre períodos
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (mode === 'diaria') next.setDate(next.getDate() - 1);
    else if (mode === 'semanal') next.setDate(next.getDate() - 7);
    else next.setMonth(next.getMonth() - 1);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (mode === 'diaria') next.setDate(next.getDate() + 1);
    else if (mode === 'semanal') next.setDate(next.getDate() + 7);
    else next.setMonth(next.getMonth() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Dias da semana corrente (Segunda a Sexta ou Segunda a Domingo)
  const weekDays = useMemo(() => {
    const curr = new Date(currentDate);
    const day = curr.getDay(); // 0 é domingo
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1); // ajusta para segunda
    const monday = new Date(curr.setDate(diff));

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

  // Dias do mês corrente
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Preenchimento antes do primeiro dia para alinhar na semana (segunda-feira)
    const startDayIndex = (firstDay.getDay() + 6) % 7;
    for (let i = startDayIndex; i > 0; i--) {
      const prevDate = new Date(year, month, 1 - i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    // Dias do mês atual
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Preenchimento final até fechar múltiplo de 7
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
      }
    }

    return days;
  }, [currentDate]);

  // Título do período
  const periodTitle = useMemo(() => {
    if (mode === 'diaria') {
      return currentDate.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
    if (mode === 'semanal') {
      const start = weekDays[0];
      const end = weekDays[6];
      return `${start.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} — ${end.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }
    return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }, [currentDate, mode, weekDays]);

  const todayStr = toISODate(new Date());

  // Horários típicos da grade (08:00 às 18:00)
  const timeSlots = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Topo com Título e Modos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Horários & Calendário Acadêmico
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Grade horária, compromissos curriculares e prazos integrados.
          </p>
        </div>

        {/* Seletores de Modo: Diária, Semanal, Mensal */}
        <div className="flex items-center space-x-1.5 bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs self-start sm:self-auto">
          <button
            onClick={() => setMode('diaria')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              mode === 'diaria' ? 'bg-[#203A65] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Diária
          </button>
          <button
            onClick={() => setMode('semanal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              mode === 'semanal' ? 'bg-[#203A65] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Semanal
          </button>
          <button
            onClick={() => setMode('mensal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              mode === 'mensal' ? 'bg-[#203A65] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Mensal
          </button>
        </div>
      </div>

      {/* Barra de Navegação do Período */}
      <div className="bg-white px-5 py-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Período anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Próximo período"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleToday}
            className="px-2.5 py-1 text-xs font-semibold text-[#203A65] bg-[#EAF0F7] rounded-lg hover:bg-[#d8e4f2] transition-colors cursor-pointer"
          >
            Hoje
          </button>

          <span className="font-bold text-sm sm:text-base text-slate-900 capitalize">
            {periodTitle}
          </span>
        </div>

        <div className="flex items-center space-x-4 text-xs text-slate-500">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#203A65]" />
            <span>Aulas & Compromissos</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>Prazos de Entrega</span>
          </span>
        </div>
      </div>

      {/* Visualização 1: Diária */}
      {mode === 'diaria' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          {(() => {
            const dateStr = toISODate(currentDate);
            const dayEvents = events.filter((e) => e.date === dateStr);
            const dayDeadlines = tasks.filter((t) => t.deadline === dateStr);

            if (dayEvents.length === 0 && dayDeadlines.length === 0) {
              return (
                <div className="py-12 text-center text-xs sm:text-sm text-slate-500 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                  <CalendarDays className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">Nenhum compromisso ou entrega para este dia.</p>
                  <p className="text-slate-400 mt-1">Navegue pelas setas para consultar outros dias da semana.</p>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {/* Prazos do Dia */}
                {dayDeadlines.map((task) => (
                  <div
                    key={`deadline-${task.id}`}
                    className="p-3.5 rounded-xl bg-red-50/60 border border-red-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-red-950 block">{task.title}</span>
                      <span className="text-red-800">{task.discipline}</span>
                    </div>
                    <span className="font-mono font-bold text-red-700 bg-white px-2.5 py-1 rounded-md border border-red-200 shrink-0">
                      Prazo Limite: 23:59
                    </span>
                  </div>
                ))}

                {/* Compromissos do Dia */}
                {dayEvents.map((evt) => {
                  const task = tasks.find((t) => t.id === evt.taskId);
                  const mapsUrl = evt.location
                    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(evt.location)}`
                    : null;

                  return (
                    <div
                      key={evt.id}
                      onClick={() => setSelectedEvent(evt)}
                      className="p-4 rounded-xl bg-[#EAF0F7]/40 border border-[#203A65]/15 hover:bg-[#EAF0F7]/60 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
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
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {evt.title || (task ? task.title : 'Compromisso Acadêmico')}
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5">{evt.discipline || (task ? task.discipline : 'Currículo')}</p>

                          {evt.location && (
                            <div className="flex items-center space-x-2 mt-1.5 text-xs text-slate-700">
                              <MapPin className="w-3.5 h-3.5 text-[#203A65] shrink-0" />
                              <span className="truncate">{evt.location}</span>
                              {mapsUrl && (
                                <a
                                  href={mapsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[11px] text-[#203A65] font-semibold hover:underline inline-flex items-center space-x-0.5 ml-1"
                                >
                                  <span>Como chegar</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* Visualização 2: Semanal (Grade de Segunda a Domingo) */}
      {mode === 'semanal' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-slate-100 min-h-[420px]">
            {weekDays.map((d) => {
              const dStr = toISODate(d);
              const isCurrentDay = dStr === todayStr;
              const dayEvts = events.filter((e) => e.date === dStr);
              const dayTasks = tasks.filter((t) => t.deadline === dStr);

              return (
                <div key={dStr} className={`p-3 flex flex-col ${isCurrentDay ? 'bg-[#EAF0F7]/25' : ''}`}>
                  {/* Cabeçalho do dia */}
                  <div className="pb-2 mb-2 border-b border-slate-100 flex items-center justify-between md:flex-col md:items-start">
                    <span className="text-xs text-slate-500 font-medium capitalize">
                      {d.toLocaleDateString('pt-BR', { weekday: 'short' })}
                    </span>
                    <span
                      className={`text-sm font-bold font-mono ${
                        isCurrentDay
                          ? 'w-6 h-6 rounded-full bg-[#203A65] text-white flex items-center justify-center text-xs'
                          : 'text-slate-800'
                      }`}
                    >
                      {d.getDate()}
                    </span>
                  </div>

                  {/* Conteúdo do dia na grade */}
                  <div className="space-y-1.5 flex-1">
                    {/* Prazos */}
                    {dayTasks.map((t) => (
                      <div
                        key={`t-${t.id}`}
                        className="p-1.5 rounded-lg bg-red-50 text-red-950 border border-red-200 text-[11px] leading-tight"
                        title={`Prazo limite: ${t.title}`}
                      >
                        <span className="font-bold block truncate">Entrega: {t.title}</span>
                        <span className="text-[10px] text-red-700 truncate block">{t.discipline}</span>
                      </div>
                    ))}

                    {/* Compromissos */}
                    {dayEvts.map((e) => (
                      <div
                        key={`e-${e.id}`}
                        onClick={() => setSelectedEvent(e)}
                        className="p-2 rounded-lg bg-[#EAF0F7] text-[#203A65] border border-[#203A65]/15 text-xs leading-tight cursor-pointer hover:bg-[#d8e4f2] transition-colors"
                      >
                        <div className="flex items-center justify-between font-mono font-bold text-[10px]">
                          <span>{e.startTime}</span>
                          <span>{e.durationMinutes}m</span>
                        </div>
                        <span className="font-semibold block truncate mt-0.5">
                          {e.title || 'Aula'}
                        </span>
                        {e.location && (
                          <span className="text-[10px] text-slate-600 block truncate flex items-center space-x-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{e.location}</span>
                          </span>
                        )}
                      </div>
                    ))}

                    {dayEvts.length === 0 && dayTasks.length === 0 && (
                      <div className="h-full min-h-[40px] flex items-center justify-center text-[11px] text-slate-300">
                        —
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Visualização 3: Mensal */}
      {mode === 'mensal' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 text-center py-2 text-xs font-semibold text-slate-600">
            <span>Seg</span>
            <span>Ter</span>
            <span>Qua</span>
            <span>Qui</span>
            <span>Sex</span>
            <span>Sáb</span>
            <span>Dom</span>
          </div>

          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 min-h-[400px]">
            {monthDays.map(({ date, isCurrentMonth }, idx) => {
              const dStr = toISODate(date);
              const isTodayDate = dStr === todayStr;
              const dayEvts = events.filter((e) => e.date === dStr);
              const dayTasks = tasks.filter((t) => t.deadline === dStr);

              return (
                <div
                  key={idx}
                  className={`p-1.5 sm:p-2 min-h-[70px] sm:min-h-[90px] flex flex-col justify-between ${
                    !isCurrentMonth ? 'bg-slate-50/40 text-slate-300' : isTodayDate ? 'bg-[#EAF0F7]/30' : 'bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span
                      className={`font-mono font-semibold ${
                        isTodayDate
                          ? 'w-5 h-5 rounded-full bg-[#203A65] text-white flex items-center justify-center text-[10px]'
                          : isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {date.getDate()}
                    </span>

                    {(dayEvts.length > 0 || dayTasks.length > 0) && (
                      <span className="text-[10px] font-mono text-slate-400">
                        {dayEvts.length + dayTasks.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1">
                    {dayTasks.slice(0, 1).map((t) => (
                      <div
                        key={t.id}
                        className="text-[10px] px-1 py-0.5 rounded bg-red-100 text-red-900 truncate"
                        title={t.title}
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayEvts.slice(0, 1).map((e) => (
                      <div
                        key={e.id}
                        onClick={() => setSelectedEvent(e)}
                        className="text-[10px] px-1 py-0.5 rounded bg-[#EAF0F7] text-[#203A65] truncate font-medium cursor-pointer"
                        title={e.title}
                      >
                        {e.startTime} {e.title || 'Aula'}
                      </div>
                    ))}
                    {dayEvts.length + dayTasks.length > 2 && (
                      <span className="text-[9px] text-slate-400 font-mono block text-center">
                        +{dayEvts.length + dayTasks.length - 2} mais
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Compromisso Selecionado */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900">
              {selectedEvent.title || 'Compromisso da Grade Acadêmica'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">{selectedEvent.discipline || 'Atividade Curricular'}</p>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#203A65]" />
                <span className="font-mono font-semibold text-slate-800">
                  Data: {selectedEvent.date} às {selectedEvent.startTime} ({selectedEvent.durationMinutes} minutos)
                </span>
              </div>

              {selectedEvent.location && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2 min-w-0 pr-2">
                    <MapPin className="w-4 h-4 text-[#203A65] shrink-0" />
                    <span className="font-semibold text-slate-800 truncate">{selectedEvent.location}</span>
                  </div>
                  <button
                    onClick={() => {
                      openLocationGuide({ room: selectedEvent.location, date: selectedEvent.date });
                      setSelectedEvent(null);
                    }}
                    className="text-xs text-[#203A65] font-bold hover:underline inline-flex items-center space-x-1 shrink-0 cursor-pointer"
                    title="Localizar sala no Mapa 3D do Campus"
                  >
                    <span>Ver no mapa 3D</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}

              {selectedEvent.notes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-600">
                  <span className="font-semibold text-slate-800 block mb-0.5">Observações:</span>
                  {selectedEvent.notes}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-[#203A65] text-white rounded-xl text-xs font-semibold hover:bg-[#182C4F] cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
