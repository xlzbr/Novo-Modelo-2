import React, { useState } from 'react';
import {
  Target,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  BookOpen,
  Award,
  Edit2,
  Check,
} from 'lucide-react';
import { useEdu } from '../context/EduContext';

export const ProgressView: React.FC = () => {
  const { tasks, preferences, updatePreferences } = useEdu();

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newGoalInput, setNewGoalInput] = useState(String(preferences.weeklyTaskGoal));

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.filter((t) => !t.completed).length;
  const totalTasks = tasks.length;

  const goal = preferences.weeklyTaskGoal;
  const isGoalSet = goal > 0;
  const percent = isGoalSet ? Math.round((completedCount / goal) * 100) : 0;
  const isExceeded = isGoalSet && completedCount > goal;

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(newGoalInput, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      updatePreferences({ weeklyTaskGoal: parsed });
      setIsEditingGoal(false);
    }
  };

  // Resumo quantitativo por disciplina
  const disciplines = Array.from(new Set(tasks.map((t) => t.discipline))).sort();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Topo */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Progresso & Metas Semanais
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Indicadores quantitativos baseados estritamente na contagem de tarefas cadastradas e concluídas.
        </p>
      </div>

      {/* Cartão Central: Meta Semanal de Tarefas */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-[#203A65]" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Meta Semanal de Tarefas Concluídas
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Representa o número de atividades acadêmicas finalizadas na semana.
            </p>
          </div>

          {!isEditingGoal ? (
            <button
              onClick={() => {
                setNewGoalInput(String(preferences.weeklyTaskGoal));
                setIsEditingGoal(true);
              }}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#203A65] bg-[#EAF0F7] hover:bg-[#d8e4f2] transition-colors cursor-pointer w-fit"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Alterar Meta ({goal})</span>
            </button>
          ) : (
            <form onSubmit={handleSaveGoal} className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                max="50"
                value={newGoalInput}
                onChange={(e) => setNewGoalInput(e.target.value)}
                className="w-20 px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#203A65]"
                aria-label="Nova meta semanal de tarefas"
              />
              <button
                type="submit"
                className="p-1.5 bg-[#203A65] text-white rounded-lg hover:bg-[#182C4F] cursor-pointer"
                title="Salvar"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsEditingGoal(false)}
                className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800"
              >
                Cancelar
              </button>
            </form>
          )}
        </div>

        {/* Exibição da Meta */}
        <div className="pt-6">
          {!isGoalSet ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold">Nenhuma meta semanal configurada.</p>
                <p className="text-xs text-amber-700 mt-1">
                  Defina uma meta numérica para calcular a porcentagem real de conclusão.
                </p>
                <button
                  onClick={() => setIsEditingGoal(true)}
                  className="mt-2 text-xs font-bold text-[#203A65] underline cursor-pointer"
                >
                  Configurar meta agora
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div className="flex items-baseline space-x-3">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#203A65] font-mono tabular-nums">
                    {percent}%
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-600">
                    da meta alcançada
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-medium text-slate-500 font-mono tabular-nums">
                  <span className="text-emerald-600 font-bold">{completedCount}</span> concluídas de{' '}
                  <span className="font-bold text-slate-800">{goal}</span> tarefas planejadas
                </div>
              </div>

              {/* Barra de Progresso Real */}
              <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-[#203A65] h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(percent, 100)}%` }}
                />
              </div>

              {isExceeded && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                  <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Parabéns! Sua meta semanal foi superada com {completedCount - goal} tarefa(s) além do previsto!
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Resumo por Disciplina (Claramente declarado como contagem quantitativa, sem inventar notas) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-[#203A65]" />
            <h3 className="font-bold text-base text-slate-900">
              Balanço Quantitativo por Disciplina
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:block">
            Contagem de atividades (não representa notas acadêmicas)
          </span>
        </div>

        {disciplines.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            Nenhuma disciplina cadastrada.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {disciplines.map((disc) => {
              const discTasks = tasks.filter((t) => t.discipline === disc);
              const done = discTasks.filter((t) => t.completed).length;
              const pending = discTasks.length - done;
              const completionRate =
                discTasks.length > 0 ? Math.round((done / discTasks.length) * 100) : 0;

              return (
                <div
                  key={disc}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate pr-2">
                      {disc}
                    </h4>
                    <span className="text-xs font-mono font-bold text-[#203A65] shrink-0">
                      {completionRate}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-200/70 rounded-full h-2 overflow-hidden mb-3">
                    <div
                      className="bg-[#203A65] h-full rounded-full transition-all duration-500"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 font-mono tabular-nums">
                    <span className="flex items-center space-x-1.5 text-emerald-600 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{done} Concluídas</span>
                    </span>
                    <span className="flex items-center space-x-1.5 text-slate-600 font-medium">
                      <Target className="w-3.5 h-3.5 text-amber-600" />
                      <span>{pending} Pendentes</span>
                    </span>
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
