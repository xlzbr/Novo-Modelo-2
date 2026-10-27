import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Clock,
  MapPin,
  FileText,
  CheckSquare,
  Calendar,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useEdu } from '../context/EduContext';
import { DisciplineInfo, Task, StudyMaterial } from '../types';

export const DisciplinesView: React.FC = () => {
  const { disciplines, tasks, materials, setActiveView } = useEdu();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDisciplineId, setExpandedDisciplineId] = useState<string | null>(null);

  // Filtragem por busca
  const filteredDisciplines = useMemo(() => {
    return disciplines.filter((d) => {
      const q = searchQuery.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        (d.code && d.code.toLowerCase().includes(q)) ||
        (d.room && d.room.toLowerCase().includes(q))
      );
    });
  }, [disciplines, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedDisciplineId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Topo com Título */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Disciplinas Curriculares
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Consulte a grade semanal, tarefas ativas e materiais disponibilizados para cada matéria.
          </p>
        </div>

        {/* Busca por Disciplina ou Código */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome ou código..."
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#203A65] focus:border-transparent transition-all bg-white"
          />
        </div>
      </div>

      {/* Lista de Disciplinas */}
      {filteredDisciplines.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">Nenhuma disciplina encontrada</p>
          <p className="text-xs text-slate-400 mt-1">Verifique os termos da sua pesquisa.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDisciplines.map((disc) => {
            const isExpanded = expandedDisciplineId === disc.id;

            // Tarefas relacionadas a esta disciplina
            const discTasks = tasks.filter((t) => t.discipline === disc.name);
            const pendingTasks = discTasks.filter((t) => !t.completed);
            const completedTasks = discTasks.filter((t) => t.completed);

            // Materiais associados a esta disciplina
            const discMaterials = materials.filter((m) => m.discipline === disc.name);

            return (
              <div
                key={disc.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all"
              >
                {/* Header do Card da Disciplina */}
                <div
                  onClick={() => toggleExpand(disc.id)}
                  className="p-5 sm:p-6 cursor-pointer hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex items-start space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#EAF0F7] text-[#203A65] flex items-center justify-center shrink-0 mt-0.5">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900 truncate">{disc.name}</h3>
                        {disc.code && (
                          <span className="text-[11px] font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {disc.code}
                          </span>
                        )}
                        {disc.workload && (
                          <span className="text-[11px] font-semibold text-[#203A65] bg-[#EAF0F7] px-2 py-0.5 rounded-md">
                            {disc.workload}
                          </span>
                        )}
                      </div>

                      {disc.room && (
                        <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{disc.room}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Resumo Rápido de Pendências + Toggle */}
                  <div className="flex items-center space-x-4 shrink-0 justify-between sm:justify-end">
                    <div className="flex items-center space-x-3 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">
                        {pendingTasks.length} pendência(s)
                      </span>
                      <span>•</span>
                      <span>{discMaterials.length} material(is)</span>
                    </div>

                    <button
                      type="button"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      aria-label={isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Área Expandida com Detalhes: Horários, Tarefas e Materiais */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100 space-y-5 bg-slate-50/30 animate-in fade-in duration-150">
                    {/* Descrição / Ementa */}
                    {disc.description && (
                      <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/70">
                        {disc.description}
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* Bloco 1: Horários Semanais */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200/70 space-y-2">
                        <div className="flex items-center space-x-1.5 font-bold text-slate-900 pb-2 border-b border-slate-100">
                          <Clock className="w-3.5 h-3.5 text-[#203A65]" />
                          <span>Grade Horária Semanal</span>
                        </div>
                        {disc.weeklySchedule && disc.weeklySchedule.length > 0 ? (
                          <div className="space-y-1.5">
                            {disc.weeklySchedule.map((sched, idx) => (
                              <div key={idx} className="p-2 rounded-lg bg-slate-50 text-slate-700 text-xs">
                                <span className="font-semibold block">{sched.dayOfWeek}</span>
                                <span className="font-mono text-slate-500 text-[11px] block">{sched.time}</span>
                                {sched.room && (
                                  <span className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
                                    <MapPin className="w-2.5 h-2.5 shrink-0" />
                                    <span className="truncate">{sched.room}</span>
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-400">Sem horários informados.</p>
                        )}
                      </div>

                      {/* Bloco 2: Tarefas Relacionadas */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200/70 space-y-2">
                        <div className="flex items-center space-x-1.5 font-bold text-slate-900 pb-2 border-b border-slate-100">
                          <CheckSquare className="w-3.5 h-3.5 text-[#203A65]" />
                          <span>Atividades da Disciplina ({discTasks.length})</span>
                        </div>
                        {discTasks.length === 0 ? (
                          <p className="text-slate-400 py-2">Nenhuma tarefa cadastrada para esta disciplina.</p>
                        ) : (
                          <div className="space-y-1.5 max-h-48 overflow-y-auto">
                            {discTasks.map((t) => (
                              <div
                                key={t.id}
                                className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                                  t.completed ? 'bg-slate-50 text-slate-400 line-through' : 'bg-slate-50 text-slate-800'
                                }`}
                              >
                                <span className="truncate pr-2 font-medium">{t.title}</span>
                                <span className="font-mono text-[10px] shrink-0">
                                  {t.deadline || 'Sem prazo'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bloco 3: Materiais Associados */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200/70 space-y-2">
                        <div className="flex items-center space-x-1.5 font-bold text-slate-900 pb-2 border-b border-slate-100">
                          <FileText className="w-3.5 h-3.5 text-[#203A65]" />
                          <span>Materiais de Estudo ({discMaterials.length})</span>
                        </div>
                        {discMaterials.length === 0 ? (
                          <p className="text-slate-400 py-2">Nenhum material publicado até o momento.</p>
                        ) : (
                          <div className="space-y-1.5 max-h-48 overflow-y-auto">
                            {discMaterials.map((mat) => (
                              <a
                                key={mat.id}
                                href={mat.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-slate-50 text-slate-700 hover:bg-[#EAF0F7] hover:text-[#203A65] transition-colors block text-xs"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold truncate pr-1">{mat.title}</span>
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                </div>
                                <span className="text-[10px] text-slate-400 mt-0.5 block">{mat.type} • {mat.fileSize || 'Arquivo'}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
