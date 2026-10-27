import React, { useState, useMemo } from 'react';
import {
  Calendar,
  AlertTriangle,
  Search,
  Filter,
  Clock,
  BookOpen,
  Eye,
  Info,
  CheckCircle2,
  FileCheck,
  UploadCloud,
  File,
} from 'lucide-react';
import { useEdu } from '../context/EduContext';
import { Task, Priority, ActivitySubmission } from '../types';

interface TasksViewProps {
  onOpenDetails: (task: Task) => void;
}

type TaskStatusFilter = 'todas' | 'pendentes' | 'concluidas' | 'vencidas';

export const TasksView: React.FC<TasksViewProps> = ({ onOpenDetails }) => {
  const { tasks, submissions, getSubmissionForTask } = useEdu();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('todas');
  const [priorityFilter, setPriorityFilter] = useState<'Todos' | Priority>('Todos');

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtra por busca, prioridade e status
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.discipline.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority =
        priorityFilter === 'Todos' || t.priority === priorityFilter;

      let matchesStatus = true;
      const isOverdue = !t.completed && t.deadline && t.deadline < todayStr;

      if (statusFilter === 'pendentes') {
        matchesStatus = !t.completed;
      } else if (statusFilter === 'concluidas') {
        matchesStatus = t.completed;
      } else if (statusFilter === 'vencidas') {
        matchesStatus = !!isOverdue;
      }

      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [tasks, searchQuery, priorityFilter, statusFilter, todayStr]);

  // Separação em: Com Prazo (ordenadas pela data mais próxima) e Sem Prazo
  const { tasksWithDeadline, tasksWithoutDeadline } = useMemo(() => {
    const withDate: (Task & { isOverdue: boolean; submission?: ActivitySubmission })[] = [];
    const withoutDate: (Task & { submission?: ActivitySubmission })[] = [];

    filteredTasks.forEach((t) => {
      const sub = getSubmissionForTask(t.id);
      if (t.deadline) {
        withDate.push({
          ...t,
          submission: sub,
          isOverdue: !t.completed && t.deadline < todayStr,
        });
      } else {
        withoutDate.push({
          ...t,
          submission: sub,
        });
      }
    });

    // Ordenação por data mais próxima
    withDate.sort((a, b) => {
      if (a.deadline! < b.deadline!) return -1;
      if (a.deadline! > b.deadline!) return 1;
      return a.title.localeCompare(b.title);
    });

    return { tasksWithDeadline: withDate, tasksWithoutDeadline: withoutDate };
  }, [filteredTasks, todayStr, getSubmissionForTask]);

  // Contagens para os filtros
  const counts = useMemo(() => {
    const total = tasks.length;
    const pendentes = tasks.filter((t) => !t.completed).length;
    const concluidas = tasks.filter((t) => t.completed).length;
    const vencidas = tasks.filter((t) => !t.completed && t.deadline && t.deadline < todayStr).length;
    return { total, pendentes, concluidas, vencidas };
  }, [tasks, todayStr]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Topo com Título e Esclarecimento de Gestão */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Tarefas Acadêmicas Publicadas
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Consulte atividades curriculares e realize a entrega formal dos arquivos exigidos.
          </p>
        </div>

        {/* Nota discreta de integração acadêmica */}
        <div className="flex items-center space-x-2 text-xs text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs">
          <Info className="w-4 h-4 text-[#203A65] shrink-0" />
          <span>Entrega validada exclusivamente por envio de arquivo</span>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        {/* Linha de Tabs de Status */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-3">
          <button
            onClick={() => setStatusFilter('todas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === 'todas'
                ? 'bg-[#203A65] text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todas ({counts.total})
          </button>

          <button
            onClick={() => setStatusFilter('pendentes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === 'pendentes'
                ? 'bg-[#203A65] text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pendentes ({counts.pendentes})
          </button>

          <button
            onClick={() => setStatusFilter('concluidas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === 'concluidas'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            Entregues ({counts.concluidas})
          </button>

          <button
            onClick={() => setStatusFilter('vencidas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === 'vencidas'
                ? 'bg-red-700 text-white shadow-2xs'
                : 'text-red-700 hover:bg-red-50'
            }`}
          >
            Vencidas ({counts.vencidas})
          </button>
        </div>

        {/* Linha de Pesquisa e Prioridade */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título ou disciplina..."
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#203A65] focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-600 font-medium">Prioridade:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as 'Todos' | Priority)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#203A65] cursor-pointer"
            >
              <option value="Todos">Todas as prioridades</option>
              <option value="Alta">Alta</option>
              <option value="Média">Média</option>
              <option value="Baixa">Baixa</option>
            </select>
          </div>
        </div>
      </div>

      {/* 1. Tarefas com Prazo Agendado */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-[#203A65]" />
            <h3 className="font-bold text-sm text-slate-900">
              Tarefas com Data Limite ({tasksWithDeadline.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400 hidden sm:block">
            Ordenadas por proximidade de entrega
          </span>
        </div>

        {tasksWithDeadline.length === 0 ? (
          <div className="p-8 text-center text-xs sm:text-sm text-slate-500">
            Nenhuma atividade encontrada para os critérios selecionados.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tasksWithDeadline.map((task) => {
              const sub = task.submission;
              const hasSub = !!sub;

              return (
                <div
                  key={task.id}
                  onClick={() => onOpenDetails(task)}
                  className={`p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:bg-slate-50/80 cursor-pointer ${
                    hasSub ? 'bg-emerald-50/20' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                    {/* Ícone de Estado de Entrega (Sem caixas de seleção genéricas) */}
                    <div className="mt-0.5 shrink-0">
                      {hasSub ? (
                        sub.isLate ? (
                          <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <FileCheck className="w-3.5 h-3.5" />
                          </div>
                        )
                      ) : task.isOverdue ? (
                        <div className="w-6 h-6 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                          <UploadCloud className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`font-semibold text-sm ${
                            hasSub ? 'text-slate-800' : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </span>

                        {hasSub ? (
                          sub.isLate ? (
                            <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Entregue com atraso</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Entregue</span>
                            </span>
                          )
                        ) : task.isOverdue ? (
                          <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                            <AlertTriangle className="w-3 h-3 text-red-600" />
                            <span>Vencida</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            <span>Pendente</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                        <span className="font-medium text-slate-700">{task.discipline}</span>
                        <span>•</span>
                        <span className="flex items-center space-x-1 font-mono tabular-nums">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Prazo: {task.deadline}</span>
                        </span>
                        {hasSub && (
                          <>
                            <span>•</span>
                            <span className="flex items-center space-x-1 text-emerald-700 font-medium">
                              <File className="w-3 h-3" />
                              <span className="truncate max-w-[180px]">{sub.fileName}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5 self-end sm:self-center shrink-0">
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-md font-semibold ${
                        task.priority === 'Alta'
                          ? 'bg-red-50 text-red-700'
                          : task.priority === 'Média'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {task.priority}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDetails(task);
                      }}
                      className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        hasSub
                          ? 'text-[#203A65] bg-[#EAF0F7] hover:bg-[#d8e4f2]'
                          : 'text-white bg-[#203A65] hover:bg-[#182C4F]'
                      }`}
                    >
                      {hasSub ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Comprovante</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Entregar Arquivo</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Tarefas Sem Prazo Fixo */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-[#203A65]" />
            <h3 className="font-bold text-sm text-slate-900">
              Atividades Contínuas Sem Prazo Fixo ({tasksWithoutDeadline.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400 hidden sm:block">
            Leituras e fundamentações pedagógicas
          </span>
        </div>

        {tasksWithoutDeadline.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            Nenhuma atividade contínua sem prazo listada.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tasksWithoutDeadline.map((task) => {
              const sub = task.submission;
              const hasSub = !!sub;

              return (
                <div
                  key={task.id}
                  onClick={() => onOpenDetails(task)}
                  className="p-4 sm:px-6 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-start space-x-3.5 min-w-0">
                    <div className="mt-0.5 shrink-0">
                      {hasSub ? (
                        <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <FileCheck className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                          <UploadCloud className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-slate-900 truncate">
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{task.discipline}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-md font-semibold ${
                        task.priority === 'Alta'
                          ? 'bg-red-50 text-red-700'
                          : task.priority === 'Média'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {task.priority}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDetails(task);
                      }}
                      className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        hasSub
                          ? 'text-[#203A65] bg-[#EAF0F7] hover:bg-[#d8e4f2]'
                          : 'text-white bg-[#203A65] hover:bg-[#182C4F]'
                      }`}
                    >
                      {hasSub ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Comprovante</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Entregar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
