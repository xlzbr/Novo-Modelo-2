import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Task } from '../types';

interface DeleteConfirmModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  task,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !task) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 id="delete-dialog-title" className="text-base font-bold text-slate-900">
              Confirmar Exclusão de Tarefa
            </h3>
            <p id="delete-dialog-description" className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Tem certeza de que deseja remover a tarefa:
              <br />
              <strong className="text-slate-900 block my-1 font-semibold">
                "{task.title}"
              </strong>
              Esta ação também desvinculará qualquer sessão de estudo programada para esta tarefa na sua agenda.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end space-x-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancelar (Manter Dados)
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
          >
            Sim, Excluir Tarefa
          </button>
        </div>
      </div>
    </div>
  );
};
