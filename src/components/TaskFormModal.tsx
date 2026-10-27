import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, AlertCircle } from 'lucide-react';
import { Task, Priority } from '../types';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: {
    title: string;
    discipline: string;
    deadline?: string;
    priority: Priority;
    notes?: string;
  }) => { success: boolean; error?: string };
  initialTask?: Task | null;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
}) => {
  const [title, setTitle] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<Priority>('Média');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialTask) {
        setTitle(initialTask.title);
        setDiscipline(initialTask.discipline);
        setDeadline(initialTask.deadline || '');
        setPriority(initialTask.priority);
        setNotes(initialTask.notes || '');
      } else {
        setTitle('');
        setDiscipline('');
        setDeadline('');
        setPriority('Média');
        setNotes('');
      }
      setErrorMessage('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialTask]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('O título da atividade acadêmica é obrigatório.');
      return;
    }
    if (!discipline.trim()) {
      setErrorMessage('O nome da disciplina é obrigatório.');
      return;
    }

    const result = onSave({
      title: title.trim(),
      discipline: discipline.trim(),
      deadline: deadline ? deadline : undefined,
      priority,
      notes: notes.trim() ? notes.trim() : undefined,
    });

    if (!result.success) {
      setErrorMessage(result.error || 'Erro ao salvar a tarefa.');
      return;
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-task-title"
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 id="modal-task-title" className="text-base sm:text-lg font-bold text-slate-900">
              {initialTask ? 'Editar Tarefa Acadêmica' : 'Nova Tarefa Acadêmica'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Campos marcados com asterisco (*) são de preenchimento obrigatório.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Fechar janela"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerta de Erro de Validação */}
        {errorMessage && (
          <div
            className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="task-title" className="block text-xs font-semibold text-slate-700 mb-1">
              Título da Tarefa <span className="text-red-500">*</span>
            </label>
            <input
              id="task-title"
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Resolução da Lista 3 de Cálculo Diferencial"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#203A65] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label htmlFor="task-discipline" className="block text-xs font-semibold text-slate-700 mb-1">
              Disciplina <span className="text-red-500">*</span>
            </label>
            <input
              id="task-discipline"
              type="text"
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value)}
              placeholder="Ex: Engenharia de Software"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#203A65] focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="task-deadline" className="block text-xs font-semibold text-slate-700 mb-1">
                Prazo de Entrega (Opcional)
              </label>
              <div className="relative">
                <input
                  id="task-deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#203A65] focus:border-transparent transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label htmlFor="task-priority" className="block text-xs font-semibold text-slate-700 mb-1">
                Prioridade
              </label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#203A65] focus:border-transparent transition-all cursor-pointer"
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="task-notes" className="block text-xs font-semibold text-slate-700 mb-1">
              Orientações ou Observações (Opcional)
            </label>
            <textarea
              id="task-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Entregar em PDF via portal ou focar nos capítulos 2 e 3"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#203A65] focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Botões de Ação */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#203A65] text-white hover:bg-[#182C4F] active:scale-[0.98] transition-all shadow-sm cursor-pointer"
            >
              {initialTask ? 'Salvar Alterações' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
