import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  FileText,
  ShieldCheck,
  UploadCloud,
  FileCheck,
  File,
  RotateCcw,
  Clock,
  ExternalLink,
  History,
  Info,
  Loader2,
} from 'lucide-react';
import { Task, ActivitySubmission } from '../types';
import { useEdu } from '../context/EduContext';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
}) => {
  const { getSubmissionForTask, submitActivity, replaceSubmission } = useEdu();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isReplacingMode, setIsReplacingMode] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reseta estados locais ao abrir nova tarefa
  useEffect(() => {
    setSelectedFile(null);
    setNotes('');
    setIsSubmitting(false);
    setUploadProgress(0);
    setErrorMessage(null);
    setSuccessNotice(null);
    setIsReplacingMode(false);
  }, [task?.id, isOpen]);

  if (!isOpen || !task) return null;

  const currentSubmission: ActivitySubmission | undefined = getSubmissionForTask(task.id);
  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = !currentSubmission && !!(task.deadline && task.deadline < todayStr);

  const allowedExtensions = task.allowedExtensions || ['.pdf', '.docx', '.pptx', '.png', '.jpg', '.zip', '.tar.gz'];
  const maxBytes = task.maxSizeBytes || 15 * 1024 * 1024;
  const maxMbStr = (maxBytes / (1024 * 1024)).toFixed(0);

  // Formatação amigável do tamanho
  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = '.' + (file.name.split('.').pop() || '').toLowerCase();
    const isAllowed = allowedExtensions.some((ext) => ext.toLowerCase() === fileExt);

    if (!isAllowed) {
      setErrorMessage(
        `Formato "${fileExt}" não aceito para esta atividade. Formatos válidos: ${allowedExtensions.join(', ')}`
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > maxBytes) {
      setErrorMessage(
        `O arquivo (${formatBytes(file.size)}) ultrapassa o tamanho máximo permitido de ${maxMbStr} MB.`
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const handleCancelFileSelection = () => {
    setSelectedFile(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmSubmit = async () => {
    if (!selectedFile) {
      setErrorMessage('Selecione um arquivo válido antes de confirmar o envio.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setUploadProgress(15);

    const progressTimer = setInterval(() => {
      setUploadProgress((prev) => (prev < 90 ? prev + 25 : prev));
    }, 180);

    try {
      let result;
      if (isReplacingMode && currentSubmission) {
        result = await replaceSubmission(task.id, selectedFile, notes);
      } else {
        result = await submitActivity(task.id, selectedFile, notes);
      }

      clearInterval(progressTimer);
      setUploadProgress(100);

      if (result.success && result.submission) {
        setSuccessNotice(
          isReplacingMode
            ? 'Arquivo substituído e nova entrega registrada com sucesso!'
            : 'Atividade entregue com sucesso! Comprovante emitido.'
        );
        setSelectedFile(null);
        setNotes('');
        setIsReplacingMode(false);
      } else {
        setErrorMessage(result.error || 'Erro inesperado ao registrar entrega.');
      }
    } catch (err) {
      clearInterval(progressTimer);
      setErrorMessage('Falha na comunicação ao enviar arquivo. Nenhuma entrega foi registrada.');
    } finally {
      setIsSubmitting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-task-detail-title"
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Topo do Modal com Status Oficial */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="min-w-0 pr-3">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md ${
                  task.priority === 'Alta'
                    ? 'bg-red-50 text-red-700'
                    : task.priority === 'Média'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Prioridade {task.priority}
              </span>

              {currentSubmission ? (
                currentSubmission.isLate ? (
                  <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Entregue com Atraso</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Entregue</span>
                  </span>
                )
              ) : isOverdue ? (
                <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-red-800 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-md">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  <span>Atrasada (Não Entregue)</span>
                </span>
              ) : selectedFile ? (
                <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                  <File className="w-3.5 h-3.5 text-blue-600" />
                  <span>Arquivo Selecionado (Aguardando Envio)</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                  <span>Pendente de Entrega</span>
                </span>
              )}
            </div>

            <h2
              id="modal-task-detail-title"
              className="text-base sm:text-xl font-bold text-slate-900 leading-snug"
            >
              {task.title}
            </h2>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
              <BookOpen className="w-3.5 h-3.5 text-[#203A65]" />
              <span className="font-semibold text-slate-700">{task.discipline}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Fechar detalhes da atividade"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com Rolagem */}
        <div className="py-4 space-y-5 overflow-y-auto flex-1 pr-1">
          {/* Mensagens de Sucesso ou Erro */}
          {successNotice && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-2.5 text-emerald-800 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{successNotice}</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  O registro foi persistido e a atividade passou para o status "Entregue".
                </p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2.5 text-red-800 text-xs">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Não foi possível registrar a entrega</p>
                <p className="text-[11px] text-red-700 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Origem Docente / Coordenação */}
          <div className="p-3 bg-[#EAF0F7]/40 rounded-xl border border-[#203A65]/10 flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-[#203A65] shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-relaxed">
              <p className="font-semibold text-slate-900">
                Atividade Curricular Publicada pela Gestão Acadêmica
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {task.publishedBy || 'Coordenação de Curso / Docente Responsável'}
              </p>
            </div>
          </div>

          {/* Enunciado e Instruções */}
          {task.description && (
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Enunciado da Atividade
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {task.description}
              </p>
            </div>
          )}

          {task.instructions && (
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Instruções de Entrega do Professor
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/50">
                {task.instructions}
              </p>
            </div>
          )}

          {/* Materiais de Apoio Disponibilizados para esta Atividade */}
          {task.supportMaterials && task.supportMaterials.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Materiais de Apoio Recomendados
              </h3>
              <div className="space-y-1.5">
                {task.supportMaterials.map((mat, idx) => (
                  <a
                    key={idx}
                    href={mat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-[#203A65] hover:bg-[#EAF0F7] transition-colors"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <FileText className="w-4 h-4 shrink-0 text-[#203A65]" />
                      <span className="truncate">{mat.title}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Regras e Metadados de Prazo / Formato */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 block font-medium">Prazo de Entrega</span>
              <span className="font-bold font-mono text-slate-800 flex items-center space-x-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-[#203A65]" />
                <span>{task.deadline ? `${task.deadline} às 23:59` : 'Sem prazo fixo'}</span>
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 block font-medium">Formatos Aceitos</span>
              <span className="font-bold text-slate-800 block truncate mt-0.5" title={allowedExtensions.join(', ')}>
                {allowedExtensions.join(', ')}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 block font-medium">Tamanho Máximo</span>
              <span className="font-bold text-slate-800 block mt-0.5">
                Até {maxMbStr} MB
              </span>
            </div>
          </div>

          {/* SEÇÃO 1: COMPROVANTE DE ENTREGA REGISTRADA (se já entregue e não estiver substituindo) */}
          {currentSubmission && !isReplacingMode && (
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileCheck className="w-5 h-5 text-emerald-700" />
                  <h4 className="font-bold text-sm text-emerald-900">
                    Comprovante Oficial de Entrega
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">
                  {currentSubmission.submissionReceiptId}
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-emerald-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <File className="w-4 h-4 text-[#203A65] shrink-0" />
                    <span className="font-bold text-slate-800 truncate" title={currentSubmission.fileName}>
                      {currentSubmission.fileName}
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px] shrink-0 ml-2">
                    {formatBytes(currentSubmission.fileSize)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span className="font-mono">
                    Registrado em:{' '}
                    {new Date(currentSubmission.submittedAt).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {currentSubmission.isLate && (
                    <span className="text-amber-700 font-bold">
                      • Entrega realizada após o prazo estipulado
                    </span>
                  )}
                </div>

                {currentSubmission.notes && (
                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-700">Nota do aluno:</span> {currentSubmission.notes}
                  </p>
                )}
              </div>

              {/* Histórico de Envios Anteriores */}
              {currentSubmission.history && currentSubmission.history.length > 0 && (
                <div className="pt-2 border-t border-emerald-200/60">
                  <div className="flex items-center space-x-1.5 text-xs text-emerald-900 font-semibold mb-1.5">
                    <History className="w-3.5 h-3.5" />
                    <span>Histórico de substituição ({currentSubmission.history.length} versão anterior)</span>
                  </div>
                  <div className="space-y-1">
                    {currentSubmission.history.map((hist, idx) => (
                      <div
                        key={idx}
                        className="text-[11px] text-slate-600 flex items-center justify-between bg-white/70 px-2.5 py-1.5 rounded-lg border border-emerald-100"
                      >
                        <span className="truncate">{hist.fileName}</span>
                        <span className="font-mono text-slate-400 text-[10px] ml-2">
                          {new Date(hist.submittedAt).toLocaleDateString('pt-BR')} ({formatBytes(hist.fileSize)})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ação de Substituição de Arquivo */}
              {task.allowsResubmission !== false && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsReplacingMode(true);
                      setErrorMessage(null);
                    }}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#203A65] bg-white border border-[#203A65]/20 hover:bg-[#EAF0F7] transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Substituir Arquivo Enviado</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SEÇÃO 2: ÁREA DE SELEÇÃO E SUBMISSÃO DE ARQUIVO */}
          {(!currentSubmission || isReplacingMode) && (
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {isReplacingMode ? 'Substituir Arquivo da Atividade' : 'Envio de Arquivo da Atividade'}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    A atividade só será considerada "Entregue" após a validação e confirmação do envio.
                  </p>
                </div>
                {isReplacingMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsReplacingMode(false);
                      setSelectedFile(null);
                      setErrorMessage(null);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer underline"
                  >
                    Cancelar substituição
                  </button>
                )}
              </div>

              {/* Drag & Drop / Input de Arquivo */}
              <input
                ref={fileInputRef}
                type="file"
                accept={allowedExtensions.join(',')}
                onChange={handleFileChange}
                className="hidden"
                id="task-file-input"
              />

              {!selectedFile ? (
                <label
                  htmlFor="task-file-input"
                  className="flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed border-slate-300 rounded-xl bg-white hover:bg-slate-50/80 hover:border-[#203A65] transition-all cursor-pointer group text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-[#EAF0F7] text-[#203A65] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800">
                    Clique para selecionar o arquivo da atividade
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                    Formatos aceitos: {allowedExtensions.join(', ')} • Máximo de {maxMbStr} MB
                  </p>
                </label>
              ) : (
                <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-[#EAF0F7] text-[#203A65] flex items-center justify-center shrink-0">
                        <File className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {formatBytes(selectedFile.size)} • Arquivo validado para envio
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCancelFileSelection}
                      disabled={isSubmitting}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Cancelar seleção deste arquivo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Campo de notas para o docente */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Observações ou comentários para o professor (opcional):
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      disabled={isSubmitting}
                      rows={2}
                      placeholder="Ex: Versão corrigida com os testes de borda solicitados..."
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#203A65] focus:border-transparent bg-slate-50/50"
                    />
                  </div>

                  {/* Barra de Progresso durante Envio */}
                  {isSubmitting && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[11px] font-medium text-slate-600">
                        <span className="flex items-center space-x-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#203A65]" />
                          <span>Validando integridade e gravando entrega...</span>
                        </span>
                        <span className="font-mono">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#203A65] h-full transition-all duration-200"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Botão de Envio Formal */}
                  <div className="pt-2 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={handleCancelFileSelection}
                      disabled={isSubmitting}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Cancelar Seleção
                    </button>

                    <button
                      type="button"
                      onClick={handleConfirmSubmit}
                      disabled={isSubmitting}
                      className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#203A65] hover:bg-[#182C4F] active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4" />
                          <span>Confirmar Envio da Atividade</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Nota de transparência sobre integração */}
              <div className="flex items-start space-x-2 text-[11px] text-slate-500 pt-1">
                <Info className="w-3.5 h-3.5 text-[#203A65] shrink-0 mt-0.5" />
                <span>
                  O arquivo é validado e registrado no armazenamento persistente do cliente com emissão de comprovante. A entrega é mantida entre sessões e vinculada ao curso.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            Folium • Módulo de Entregas Curriculares
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
